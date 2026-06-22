import { queue } from "./queue";

const POLL_INTERVAL_MS = 500;
const RETRY_BACKOFF_MS = 1000;

let running = false;
let timer: ReturnType<typeof setTimeout> | null = null;

const scheduleNext = (delayMs: number): void => {
  if (!running) return;
  timer = setTimeout(() => void tick(), delayMs);
};

const tick = async (): Promise<void> => {
  if (!running) return;

  const job = await queue.processNext();

  if (job === null) {
    scheduleNext(POLL_INTERVAL_MS);
    return;
  }

  const delay = job.status === "failed" ? RETRY_BACKOFF_MS : 0;
  scheduleNext(delay);
};

export const startWorker = (): void => {
  if (running) return;
  running = true;
  scheduleNext(0);
};

export const stopWorker = (): void => {
  running = false;
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
};
