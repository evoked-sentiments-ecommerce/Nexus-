type AnyQueue = any;
type AnyWorker = any;
export declare function createQueue(name: string): AnyQueue;
export declare function createWorker(name: string, processor: (job: AnyQueue) => Promise<unknown>): AnyWorker | null;
export declare function addJob(queue: AnyQueue, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
export declare const agentQueue: any;
export declare function initWorkers(): AnyWorker | null;
export {};
//# sourceMappingURL=index.d.ts.map