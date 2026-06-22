export type IntelligenceModule = "memory" | "planner" | "reasoning" | "executor" | "learning" | "evolution";
export interface KernelContext {
    /** Unique identifier for the session / request driving this cycle. */
    sessionId: string;
    /** Authenticated user ID, if available. */
    userId?: string;
    /** Project scope, if the cycle is scoped to a single project. */
    projectId?: string;
    /** Arbitrary key-value bag of extra context. */
    meta?: Record<string, unknown>;
}
export interface KernelResult {
    sessionId: string;
    modulesRun: IntelligenceModule[];
    durationMs: number;
    outputs: Partial<Record<IntelligenceModule, unknown>>;
    errors: Partial<Record<IntelligenceModule, string>>;
}
export interface ModuleHandler<TInput = KernelContext, TOutput = unknown> {
    name: IntelligenceModule;
    run(input: TInput): Promise<TOutput>;
}
/**
 * Register an intelligence module with the kernel.
 * Later registrations overwrite earlier ones for the same module name.
 */
export declare function registerModule(handler: ModuleHandler): void;
/**
 * Return the handler registered for a given module, or undefined.
 */
export declare function getModule(name: IntelligenceModule): ModuleHandler | undefined;
/**
 * Run an ordered intelligence cycle.
 *
 * Modules execute sequentially in the order supplied (defaults to the
 * canonical pipeline order).  Each module receives the shared KernelContext;
 * its output is stored in the result bag and can be accessed by subsequent
 * modules via the context meta field if wired accordingly.
 *
 * Failures in one module are captured and logged without aborting the rest of
 * the pipeline.
 */
export declare function runCycle(ctx: KernelContext, modules?: IntelligenceModule[]): Promise<KernelResult>;
/**
 * Return the names of all currently registered modules.
 */
export declare function registeredModules(): IntelligenceModule[];
//# sourceMappingURL=index.d.ts.map