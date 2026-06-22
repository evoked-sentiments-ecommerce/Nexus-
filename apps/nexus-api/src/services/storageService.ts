import { extname } from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type UploadFileInput = {
  key: string;
  fileName: string;
  data: Buffer;
  contentType?: string;
};

export type UploadedFile = {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
};

export type DownloadedFile = {
  key: string;
  data: Buffer;
  contentType: string;
  contentLength: number;
  etag: string | null;
  lastModified: string | null;
};

export type ListedFile = {
  key: string;
  size: number;
  lastModified: string | null;
  etag: string | null;
  url: string;
};

const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".zip",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".tif",
  ".tiff",
  ".ico",
  ".heic",
  ".heif",
]);

const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
]);

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getConfig = () => ({
  accountId: getRequiredEnv("R2_ACCOUNT_ID"),
  accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
  secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
  bucketName: getRequiredEnv("R2_BUCKET_NAME"),
  publicUrl: getRequiredEnv("R2_PUBLIC_URL").replace(/\/$/, ""),
});

let client: S3Client | null = null;

const getClient = (): S3Client => {
  if (!client) {
    const config = getConfig();
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return client;
};

const normalizeKey = (value: string): string => {
  const key = value.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!key) {
    throw new Error("File key cannot be empty");
  }

  return key;
};

const isImageMime = (value: string): boolean => value.toLowerCase().startsWith("image/");

const assertSupportedAsset = (key: string, contentType?: string): void => {
  const extension = extname(key).toLowerCase();
  const normalizedContentType = contentType?.toLowerCase();

  const isSupportedByExtension = extension ? SUPPORTED_EXTENSIONS.has(extension) : false;
  const isSupportedByMime = normalizedContentType
    ? SUPPORTED_MIME_TYPES.has(normalizedContentType) || isImageMime(normalizedContentType)
    : false;

  if (!isSupportedByExtension && !isSupportedByMime) {
    throw new Error(
      "Unsupported asset type. Supported assets: PDF, DOCX, XLSX, ZIP, and images",
    );
  }
};

const toBuffer = async (stream: AsyncIterable<Uint8Array>): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const getPublicFileUrl = (key: string): string => `${getConfig().publicUrl}/${encodeURI(key)}`;

export const uploadFile = async (input: UploadFileInput): Promise<UploadedFile> => {
  const config = getConfig();
  const key = normalizeKey(input.key || input.fileName);
  const contentType = input.contentType?.trim() || "application/octet-stream";

  assertSupportedAsset(key, contentType);

  await getClient().send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: input.data,
      ContentType: contentType,
      ContentLength: input.data.length,
    }),
  );

  return {
    key,
    fileName: input.fileName,
    contentType,
    size: input.data.length,
    url: getPublicFileUrl(key),
  };
};

export const downloadFile = async (inputKey: string): Promise<DownloadedFile> => {
  const config = getConfig();
  const key = normalizeKey(inputKey);

  const response = await getClient().send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("File not found");
  }

  const data = await toBuffer(response.Body as AsyncIterable<Uint8Array>);

  return {
    key,
    data,
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: Number(response.ContentLength ?? data.length),
    etag: response.ETag ?? null,
    lastModified: response.LastModified?.toISOString() ?? null,
  };
};

export const deleteFile = async (inputKey: string): Promise<void> => {
  const config = getConfig();
  const key = normalizeKey(inputKey);

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );
};

export const generateSignedUrl = async (
  inputKey: string,
  expiresIn = 900,
): Promise<{ key: string; url: string; expiresIn: number }> => {
  const config = getConfig();
  const key = normalizeKey(inputKey);

  if (!Number.isInteger(expiresIn) || expiresIn < 60 || expiresIn > 604800) {
    throw new Error("Invalid expiresIn value. Use a number between 60 and 604800 seconds");
  }

  const url = await getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn },
  );

  return { key, url, expiresIn };
};

export const listFiles = async (
  prefix?: string,
  maxKeys = 100,
): Promise<{ files: ListedFile[]; count: number }> => {
  const config = getConfig();

  const response = await getClient().send(
    new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: prefix ? normalizeKey(prefix) : undefined,
      MaxKeys: Math.min(Math.max(maxKeys, 1), 1000),
    }),
  );

  const files: ListedFile[] = (response.Contents ?? [])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.Key))
    .map((entry) => {
      const key = normalizeKey(entry.Key as string);
      return {
        key,
        size: Number(entry.Size ?? 0),
        lastModified: entry.LastModified?.toISOString() ?? null,
        etag: entry.ETag ?? null,
        url: getPublicFileUrl(key),
      };
    });

  return { files, count: files.length };
};
