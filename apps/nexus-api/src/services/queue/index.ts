// ---------------------------------------------------------------------------
// Job Queue — BullMQ-backed async job processing with graceful degradation
// ---------------------------------------------------------------------------

import { logInfo, logWarn, logError } from "../logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQueue = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWorker = any;

function getBullMQ(): { Queue: any; Worker: any } | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    logWarn("queue_degraded", { reason: "REDIS_URL not set" });
    return null;
  }

  try {
    return require("bullmq");
  } catch {
    logWarn("queue_degraded", { reason: "bullmq not available" });
    return null;
  }
}

function getRedisConnection(): { host: string; port: number } | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return { host: parsed.hostname, port: parseInt(parsed.port || "6379", 10) };
  } catch {
    return null;
  }
}

const noopQueue = {
  add: async () => null,
  close: async () => {},
};

export function createQueue(name: string): AnyQueue {
  const bullmq = getBullMQ();
  const connection = getRedisConnection();
  if (!bullmq || !connection) {
    return noopQueue;
  }

  try {
    return new bullmq.Queue(name, { connection });
  } catch (err) {
    logError("queue_create_error", { name, message: err instanceof Error ? err.message : String(err) });
    return noopQueue;
  }
}

export function createWorker(
  name: string,
  processor: (job: AnyQueue) => Promise<unknown>
): AnyWorker | null {
  const bullmq = getBullMQ();
  const connection = getRedisConnection();
  if (!bullmq || !connection) {
    return null;
  }

  try {
    const worker = new bullmq.Worker(name, processor, { connection });
    worker.on("failed", (job: AnyQueue, err: Error) => {
      logError("worker_job_failed", { name, jobId: job?.id, message: err.message });
    });
    return worker;
  } catch (err) {
    logError("worker_create_error", { name, message: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function addJob(
  queue: AnyQueue,
  data: Record<string, unknown>,
  options?: Record<string, unknown>
): Promise<void> {
  try {
    await queue.add("job", data, options);
    logInfo("queue_job_added", { data: JSON.stringify(data).slice(0, 100) });
  } catch (err) {
    logError("queue_add_error", { message: err instanceof Error ? err.message : String(err) });
  }
}

export const agentQueue = createQueue("agent-tasks");

export function initWorkers(): AnyWorker | null {
  const { runAgent } = require("../agents");
  return createWorker("agent-tasks", async (job: AnyQueue) => {
    const task = job.data;
    logInfo("worker_processing_task", { taskId: task.taskId, agentName: task.agentName });
    const result = await runAgent(task);
    logInfo("worker_task_complete", { taskId: task.taskId, status: result.status });
    return result;
  });
}
