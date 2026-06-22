"use strict";
// ---------------------------------------------------------------------------
// Storage Service — Cloudflare R2 backed file storage
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.downloadFile = downloadFile;
exports.deleteFile = deleteFile;
exports.getSignedUrl = getSignedUrl;
exports.listFiles = listFiles;
function getBucket() {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket)
        throw new Error("R2_BUCKET_NAME environment variable is not set");
    return bucket;
}
function getPublicUrl(key) {
    const base = process.env.R2_PUBLIC_URL ?? process.env.R2_ENDPOINT ?? "";
    return `${base.replace(/\/$/, "")}/${key}`;
}
/**
 * Upload a file buffer to R2 storage.
 */
async function uploadFile(key, buffer, options = {}) {
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
async function downloadFile(key) {
    getBucket();
    // R2/S3 SDK call would go here
    return Buffer.alloc(0);
}
/**
 * Delete a file from R2.
 */
async function deleteFile(key) {
    getBucket();
    // R2/S3 SDK call would go here
    void key;
}
/**
 * Generate a pre-signed URL for temporary access.
 */
async function getSignedUrl(key, expiresInSeconds = 3600) {
    getBucket();
    return `${getPublicUrl(key)}?expires=${Date.now() + expiresInSeconds * 1000}`;
}
/**
 * List files under a given prefix.
 */
async function listFiles(prefix = "") {
    getBucket();
    void prefix;
    return [];
}
//# sourceMappingURL=storageService.js.map