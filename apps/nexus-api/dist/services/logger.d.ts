export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
}
export declare function logDebug(message: string, context?: Record<string, unknown>): void;
export declare function logInfo(message: string, context?: Record<string, unknown>): void;
export declare function logWarn(message: string, context?: Record<string, unknown>): void;
export declare function logError(message: string, context?: Record<string, unknown>): void;
export interface RequestLogData {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    userId?: string;
    ip?: string;
    userAgent?: string;
}
/**
 * Log an incoming HTTP request and its response details.
 */
export declare function logRequest(data: RequestLogData): void;
export interface ErrorLogData {
    message: string;
    stack?: string;
    code?: string | number;
    path?: string;
    userId?: string;
    context?: Record<string, unknown>;
}
/**
 * Log an application error with optional stack trace and context.
 */
export declare function logAppError(data: ErrorLogData): void;
export type JobStatus = "started" | "completed" | "failed" | "retrying";
export interface JobLogData {
    jobId: string;
    jobName: string;
    status: JobStatus;
    durationMs?: number;
    attempt?: number;
    error?: string;
    meta?: Record<string, unknown>;
}
/**
 * Log a background job lifecycle event (start, complete, failure, retry).
 */
export declare function logJob(data: JobLogData): void;
export type BillingEventType = "subscription_created" | "subscription_updated" | "subscription_cancelled" | "payment_succeeded" | "payment_failed" | "invoice_generated" | "trial_started" | "trial_ended";
export interface BillingLogData {
    event: BillingEventType;
    customerId: string;
    subscriptionId?: string;
    invoiceId?: string;
    amountCents?: number;
    currency?: string;
    plan?: string;
    userId?: string;
    meta?: Record<string, unknown>;
}
/**
 * Log a billing lifecycle event.
 */
export declare function logBilling(data: BillingLogData): void;
export type StorageOperation = "upload" | "download" | "delete" | "signed_url" | "list";
export interface StorageLogData {
    operation: StorageOperation;
    key: string;
    bucket?: string;
    sizeBytes?: number;
    contentType?: string;
    durationMs?: number;
    success: boolean;
    error?: string;
    userId?: string;
}
/**
 * Log a storage operation (upload, download, delete, signed URL, list).
 */
export declare function logStorage(data: StorageLogData): void;
//# sourceMappingURL=logger.d.ts.map