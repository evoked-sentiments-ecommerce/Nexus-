"use strict";
// ---------------------------------------------------------------------------
// Job Queue — BullMQ-backed async job processing with graceful degradation
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentQueue = void 0;
exports.createQueue = createQueue;
exports.createWorker = createWorker;
exports.addJob = addJob;
exports.initWorkers = initWorkers;
const logger_1 = require("../logger");
function getBullMQ() {
    const url = process.env.REDIS_URL;
    if (!url) {
        (0, logger_1.logWarn)("queue_degraded", { reason: "REDIS_URL not set" });
        return null;
    }
    try {
        return require("bullmq");
    }
    catch {
        (0, logger_1.logWarn)("queue_degraded", { reason: "bullmq not available" });
        return null;
    }
}
function getRedisConnection() {
    const url = process.env.REDIS_URL;
    if (!url) {
        return null;
    }
    try {
        const parsed = new URL(url);
        return { host: parsed.hostname, port: parseInt(parsed.port || "6379", 10) };
    }
    catch {
        return null;
    }
}
const noopQueue = {
    add: async () => null,
    close: async () => { },
};
function createQueue(name) {
    const bullmq = getBullMQ();
    const connection = getRedisConnection();
    if (!bullmq || !connection) {
        return noopQueue;
    }
    try {
        return new bullmq.Queue(name, { connection });
    }
    catch (err) {
        (0, logger_1.logError)("queue_create_error", { name, message: err instanceof Error ? err.message : String(err) });
        return noopQueue;
    }
}
function createWorker(name, processor) {
    const bullmq = getBullMQ();
    const connection = getRedisConnection();
    if (!bullmq || !connection) {
        return null;
    }
    try {
        const worker = new bullmq.Worker(name, processor, { connection });
        worker.on("failed", (job, err) => {
            (0, logger_1.logError)("worker_job_failed", { name, jobId: job?.id, message: err.message });
        });
        return worker;
    }
    catch (err) {
        (0, logger_1.logError)("worker_create_error", { name, message: err instanceof Error ? err.message : String(err) });
        return null;
    }
}
async function addJob(queue, data, options) {
    try {
        await queue.add("job", data, options);
        (0, logger_1.logInfo)("queue_job_added", { data: JSON.stringify(data).slice(0, 100) });
    }
    catch (err) {
        (0, logger_1.logError)("queue_add_error", { message: err instanceof Error ? err.message : String(err) });
    }
}
exports.agentQueue = createQueue("agent-tasks");
function initWorkers() {
    const { runAgent } = require("../agents");
    return createWorker("agent-tasks", async (job) => {
        const task = job.data;
        (0, logger_1.logInfo)("worker_processing_task", { taskId: task.taskId, agentName: task.agentName });
        const result = await runAgent(task);
        (0, logger_1.logInfo)("worker_task_complete", { taskId: task.taskId, status: result.status });
        return result;
    });
}
//# sourceMappingURL=index.js.map