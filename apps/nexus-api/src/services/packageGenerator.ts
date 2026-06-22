import { randomUUID } from "node:crypto";
import { basename, extname } from "node:path";
import { deflateRawSync } from "node:zlib";
import { downloadFile, uploadFile } from "./storageService";

type PackageAssetType = "document" | "pdf" | "asset";

export type GeneratePackageInput = {
  packageId: string;
  projectId: string;
  packageName: string;
  includedDocuments: string[];
  includedPDFs: string[];
  includedAssets: string[];
};

export type PackageAssetManifestItem = {
  id: string;
  type: PackageAssetType;
  key: string;
  fileName: string;
  zipPath: string;
  contentType: string;
  size: number;
};

export type GeneratedPackage = {
  packageUrl: string;
  assetManifest: PackageAssetManifestItem[];
};

class PackageAssetNotFoundError extends Error {
  constructor(
    readonly assetType: PackageAssetType,
    readonly assetId: string,
  ) {
    super(`Package ${assetType} asset not found: ${assetId}`);
    this.name = "PackageAssetNotFoundError";
  }
}

type DownloadedPackageAsset = PackageAssetManifestItem & {
  data: Buffer;
};

type ZipEntry = {
  path: string;
  data: Buffer;
};

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) === 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }

  return table;
})();

const isNotFoundError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return error.message.includes("not found") || error.message.includes("NoSuchKey");
};

const trimBoundaryDashes = (value: string): string => {
  let start = 0;
  let end = value.length;

  while (start < end && value[start] === "-") {
    start += 1;
  }

  while (end > start && value[end - 1] === "-") {
    end -= 1;
  }

  return value.slice(start, end);
};

const toSlug = (value: string): string =>
  trimBoundaryDashes(value.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 80) ||
  "package";

const sanitizeSegment = (value: string): string =>
  value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.\.+/g, "")
    .replace(/[^a-zA-Z0-9._/-]+/g, "-")
    .replace(/\/+/g, "/");

const crc32 = (value: Buffer): number => {
  let crc = 0xffffffff;
  for (const byte of value) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const toDosDateTime = (date = new Date()) => {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2) & 0x1f) << 0);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0xf) << 5) |
    (date.getDate() & 0x1f);

  return { dosDate, dosTime };
};

const buildZip = (entries: ZipEntry[]): Buffer => {
  const localFiles: Buffer[] = [];
  const centralFiles: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const entryName = sanitizeSegment(entry.path);
    const nameBuffer = Buffer.from(entryName, "utf8");
    const uncompressed = entry.data;
    const compressed = deflateRawSync(uncompressed);
    const checksum = crc32(uncompressed);
    const { dosDate, dosTime } = toDosDateTime();

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(uncompressed.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const localFile = Buffer.concat([localHeader, nameBuffer, compressed]);
    localFiles.push(localFile);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(uncompressed.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    const centralFile = Buffer.concat([centralHeader, nameBuffer]);
    centralFiles.push(centralFile);
    offset += localFile.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectory = Buffer.concat(centralFiles);
  const centralDirectorySize = centralDirectory.length;
  const endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(entries.length, 8);
  endOfCentralDirectory.writeUInt16LE(entries.length, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectorySize, 12);
  endOfCentralDirectory.writeUInt32LE(centralDirectoryOffset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  return Buffer.concat([...localFiles, centralDirectory, endOfCentralDirectory]);
};

const buildKeyCandidates = (assetType: PackageAssetType, value: string): string[] => {
  const key = sanitizeSegment(value);
  const candidates = new Set<string>([key]);

  if (assetType === "document") {
    candidates.add(`documents/${key}`);
    candidates.add(`docs/${key}`);
  }

  if (assetType === "pdf") {
    candidates.add(`pdf/${key}`);
    candidates.add(`pdf/${key}.pdf`);
    candidates.add(`pdfs/${key}`);
    candidates.add(`pdfs/${key}.pdf`);
  }

  if (assetType === "asset") {
    candidates.add(`assets/${key}`);
  }

  return Array.from(candidates);
};

const deriveFileName = (assetId: string, key: string, contentType: string): string => {
  const fromKey = basename(key).trim();
  if (fromKey) return fromKey;

  const normalizedId = toSlug(assetId);
  if (contentType === "application/pdf") return `${normalizedId}.pdf`;

  const extension = extname(assetId).toLowerCase();
  if (extension) return `${normalizedId}${extension}`;

  return normalizedId;
};

const buildUniqueZipPath = (
  folder: string,
  fileName: string,
  usedPaths: Set<string>,
): string => {
  const baseFolder = sanitizeSegment(folder).replace(/\/$/, "");
  const ext = extname(fileName);
  const name = fileName.slice(0, Math.max(1, fileName.length - ext.length));

  let count = 0;
  while (true) {
    const nextName = count === 0 ? `${name}${ext}` : `${name}-${count}${ext}`;
    const nextPath = `${baseFolder}/${sanitizeSegment(nextName)}`;
    if (!usedPaths.has(nextPath)) {
      usedPaths.add(nextPath);
      return nextPath;
    }
    count += 1;
  }
};

const resolveAssetFolder = (assetType: PackageAssetType): string => {
  if (assetType === "document") return "documents";
  if (assetType === "pdf") return "pdfs";
  return "assets";
};

const downloadPackageAsset = async (
  assetType: PackageAssetType,
  assetId: string,
  usedPaths: Set<string>,
): Promise<DownloadedPackageAsset> => {
  const candidates = buildKeyCandidates(assetType, assetId);

  for (const key of candidates) {
    try {
      const downloaded = await downloadFile(key);
      const fileName = deriveFileName(assetId, downloaded.key, downloaded.contentType);
      const zipPath = buildUniqueZipPath(resolveAssetFolder(assetType), fileName, usedPaths);

      return {
        id: assetId,
        type: assetType,
        key: downloaded.key,
        fileName,
        zipPath,
        contentType: downloaded.contentType,
        size: downloaded.contentLength,
        data: downloaded.data,
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new PackageAssetNotFoundError(assetType, assetId);
};

const collectAssets = async (
  type: PackageAssetType,
  ids: string[],
  usedPaths: Set<string>,
): Promise<DownloadedPackageAsset[]> => {
  const assets: DownloadedPackageAsset[] = [];
  for (const id of ids) {
    assets.push(await downloadPackageAsset(type, id, usedPaths));
  }

  return assets;
};

export const generateAndStorePackage = async (
  input: GeneratePackageInput,
): Promise<GeneratedPackage> => {
  const usedPaths = new Set<string>();
  const documents = await collectAssets("document", input.includedDocuments, usedPaths);
  const pdfs = await collectAssets("pdf", input.includedPDFs, usedPaths);
  const assets = await collectAssets("asset", input.includedAssets, usedPaths);
  const allAssets = [...documents, ...pdfs, ...assets];

  const zipBuffer = buildZip(
    allAssets.map((asset) => ({
      path: asset.zipPath,
      data: asset.data,
    })),
  );

  const zipKey = `packages/${sanitizeSegment(input.projectId)}/${sanitizeSegment(input.packageId)}-${randomUUID()}.zip`;
  const zipName = `${toSlug(input.packageName)}.zip`;

  const uploaded = await uploadFile({
    key: zipKey,
    fileName: zipName,
    data: zipBuffer,
    contentType: "application/zip",
  });

  return {
    packageUrl: uploaded.url,
    assetManifest: allAssets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      key: asset.key,
      fileName: asset.fileName,
      zipPath: asset.zipPath,
      contentType: asset.contentType,
      size: asset.size,
    })),
  };
};

export { PackageAssetNotFoundError };
