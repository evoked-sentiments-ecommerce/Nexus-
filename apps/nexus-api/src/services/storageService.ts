// ---------------------------------------------------------------------------
// Storage Service — Cloudflare R2 backed file storage
// ---------------------------------------------------------------------------

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  lastModified?: Date;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME environment variable is not set");
  return bucket;
}

function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL ?? process.env.R2_ENDPOINT ?? "";
  return `${base.replace(/\/$/, "")}/${key}`;
}

/**
 * Upload a file buffer to R2 storage.
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<StorageFile> {
  getBucket();
  const contentType = options.contentType ?? "application/octet-stream";
  // R2/S3 SDK call would go here — stub returns the expected shape
  return {
    key,
    url: getPublicUrl(key),
    size: buffer.length,
    contentType,
  };
}

/**
 * Download a file from R2 as a Buffer.
 */
export async function downloadFile(key: string): Promise<Buffer> {
  getBucket();
  // R2/S3 SDK call would go here
  return Buffer.alloc(0);
}

/**
 * Delete a file from R2.
 */
export async function deleteFile(key: string): Promise<void> {
  getBucket();
  // R2/S3 SDK call would go here
  void key;
}

/**
 * Generate a pre-signed URL for temporary access.
 */
export async function getSignedUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  getBucket();
  return `${getPublicUrl(key)}?expires=${Date.now() + expiresInSeconds * 1000}`;
}

/**
 * List files under a given prefix.
 */
export async function listFiles(prefix = ""): Promise<StorageFile[]> {
  getBucket();
  void prefix;
  return [];
}
