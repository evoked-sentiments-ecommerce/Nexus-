"use strict";
// ---------------------------------------------------------------------------
// Logger Service — structured logging for requests, errors, jobs, billing,
// and storage events throughout the Nexus API.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = logDebug;
exports.logInfo = logInfo;
exports.logWarn = logWarn;
exports.logError = logError;
exports.logRequest = logRequest;
exports.logAppError = logAppError;
exports.logJob = logJob;
exports.logBilling = logBilling;
exports.logStorage = logStorage;
// ---------------------------------------------------------------------------
// Core emit helper
// ---------------------------------------------------------------------------
function emit(level, message, context) {
    const entry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(context && { context }),
    };
    const line = JSON.stringify(entry);
    if (level === "error" || level === "warn") {
        console.error(line);
    }
    else {
        console.log(line);
    }
}
// ---------------------------------------------------------------------------
// Generic log helpers
// ---------------------------------------------------------------------------
function logDebug(message, context) {
    emit("debug", message, context);
}
function logInfo(message, context) {
    emit("info", message, context);
}
function logWarn(message, context) {
    emit("warn", message, context);
}
function logError(message, context) {
    emit("error", message, context);
}
/**
 * Log an incoming HTTP request and its response details.
 */
function logRequest(data) {
    emit("info", "http_request", { type: "request", ...data });
}
/**
 * Log an application error with optional stack trace and context.
 */
function logAppError(data) {
    emit("error", "app_error", { type: "error", ...data });
}
/**
 * Log a background job lifecycle event (start, complete, failure, retry).
 */
function logJob(data) {
    const level = data.status === "failed" ? "error" : "info";
    emit(level, "job_event", { type: "job", ...data });
}
/**
 * Log a billing lifecycle event.
 */
function logBilling(data) {
    const level = data.event === "payment_failed" ? "warn" : "info";
    emit(level, "billing_event", { type: "billing", ...data });
}
/**
 * Log a storage operation (upload, download, delete, signed URL, list).
 */
function logStorage(data) {
    const level = data.success ? "info" : "error";
    emit(level, "storage_event", { type: "storage", ...data });
}
//# sourceMappingURL=logger.js.map