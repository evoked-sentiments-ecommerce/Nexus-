import { randomUUID } from "node:crypto";

export type JobType = "pdf" | "package" | "blueprint";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job<TPayload = unknown, TResult = unknown> {
  id: string;
  type: JobType;
  payload: TPayload;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  result: TResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JobHandler<TPayload = unknown, TResult = unknown> = (
  job: Job<TPayload, TResult>,
) => Promise<TResult>;

export type EnqueueOptions = {
  maxAttempts?: number;
};

const DEFAULT_MAX_ATTEMPTS = 3;

class JobQueue {
  private readonly jobs = new Map<string, Job>();
  private readonly pending: string[] = [];
  private readonly handlers = new Map<JobType, JobHandler>();

  register<TPayload, TResult>(
    type: JobType,
    handler: JobHandler<TPayload, TResult>,
  ): void {
    this.handlers.set(type, handler as JobHandler);
  }

  enqueue<TPayload>(
    type: JobType,
    payload: TPayload,
    options: EnqueueOptions = {},
  ): Job<TPayload> {
    const now = new Date().toISOString();
    const job: Job<TPayload> = {
      id: `job_${randomUUID()}`,
      type,
      payload,
      status: "pending",
      attempts: 0,
      maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      result: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(job.id, job as Job);
    this.pending.push(job.id);
    return job;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  listJobs(filter?: { type?: JobType; status?: JobStatus }): Job[] {
    const all = Array.from(this.jobs.values());
    if (!filter) return all;

    return all.filter((job) => {
      if (filter.type !== undefined && job.type !== filter.type) return false;
      if (filter.status !== undefined && job.status !== filter.status) return false;
      return true;
    });
  }

  async processNext(): Promise<Job | null> {
    const jobId = this.pending.shift();
    if (!jobId) return null;

    const job = this.jobs.get(jobId);
    if (!job) return null;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      this.updateJob(job, {
        status: "failed",
        error: `No handler registered for job type: ${job.type}`,
      });
      return job;
    }

    this.updateJob(job, { status: "running", attempts: job.attempts + 1 });

    try {
      const result = await handler(job);
      this.updateJob(job, { status: "completed", result, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (job.attempts < job.maxAttempts) {
        this.updateJob(job, { status: "pending", error: message });
        this.pending.push(job.id);
      } else {
        this.updateJob(job, { status: "failed", error: message });
      }
    }

    return job;
  }

  get pendingCount(): number {
    return this.pending.length;
  }

  private updateJob(job: Job, changes: Partial<Job>): void {
    Object.assign(job, changes, { updatedAt: new Date().toISOString() });
  }
}

export const queue = new JobQueue();
