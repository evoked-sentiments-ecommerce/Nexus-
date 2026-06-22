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
/**
 * Upload a file buffer to R2 storage.
 */
export declare function uploadFile(key: string, buffer: Buffer, options?: UploadOptions): Promise<StorageFile>;
/**
 * Download a file from R2 as a Buffer.
 */
export declare function downloadFile(key: string): Promise<Buffer>;
/**
 * Delete a file from R2.
 */
export declare function deleteFile(key: string): Promise<void>;
/**
 * Generate a pre-signed URL for temporary access.
 */
export declare function getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
/**
 * List files under a given prefix.
 */
export declare function listFiles(prefix?: string): Promise<StorageFile[]>;
//# sourceMappingURL=storageService.d.ts.map