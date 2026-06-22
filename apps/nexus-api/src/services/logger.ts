// ---------------------------------------------------------------------------
// Logger Service — structured logging for requests, errors, jobs, billing,
// and storage events throughout the Nexus API.
// ---------------------------------------------------------------------------

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Core emit helper
// ---------------------------------------------------------------------------

function emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
  };

  const line = JSON.stringify(entry);

  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

// ---------------------------------------------------------------------------
// Generic log helpers
// ---------------------------------------------------------------------------

export function logDebug(message: string, context?: Record<string, unknown>): void {
  emit("debug", message, context);
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  emit("info", message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  emit("warn", message, context);
}

export function logError(message: string, context?: Record<string, unknown>): void {
  emit("error", message, context);
}

// ---------------------------------------------------------------------------
// Request Logging
// ---------------------------------------------------------------------------

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
export function logRequest(data: RequestLogData): void {
  emit("info", "http_request", { type: "request", ...data });
}

// ---------------------------------------------------------------------------
// Error Logging
// ---------------------------------------------------------------------------

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
export function logAppError(data: ErrorLogData): void {
  emit("error", "app_error", { type: "error", ...data });
}

// ---------------------------------------------------------------------------
// Job Logging
// ---------------------------------------------------------------------------

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
export function logJob(data: JobLogData): void {
  const level: LogLevel = data.status === "failed" ? "error" : "info";
  emit(level, "job_event", { type: "job", ...data });
}

// ---------------------------------------------------------------------------
// Billing Logging
// ---------------------------------------------------------------------------

export type BillingEventType =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "payment_succeeded"
  | "payment_failed"
  | "invoice_generated"
  | "trial_started"
  | "trial_ended";

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
export function logBilling(data: BillingLogData): void {
  const level: LogLevel = data.event === "payment_failed" ? "warn" : "info";
  emit(level, "billing_event", { type: "billing", ...data });
}

// ---------------------------------------------------------------------------
// Storage Logging
// ---------------------------------------------------------------------------

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
export function logStorage(data: StorageLogData): void {
  const level: LogLevel = data.success ? "info" : "error";
  emit(level, "storage_event", { type: "storage", ...data });
}
