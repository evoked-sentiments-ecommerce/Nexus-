export type CapabilityName = "observe" | "remember" | "learn" | "reason" | "predict" | "simulate" | "plan" | "execute" | "evaluate" | "improve" | "evolve";
export interface IntelligenceContext {
    cycleId: string;
    userId?: string;
    projectId?: string;
    objective?: string;
    inputs: Record<string, unknown>;
    memory: Record<string, unknown>;
}
export interface CapabilityHandler {
    name: CapabilityName;
    run(ctx: IntelligenceContext): Promise<unknown>;
}
export interface CycleResult {
    cycleId: string;
    capabilitiesRun: CapabilityName[];
    outputs: Partial<Record<CapabilityName, unknown>>;
    errors: Partial<Record<CapabilityName, string>>;
    durationMs: number;
}
export declare function registerCapability(handler: CapabilityHandler): void;
export declare function getCapability(name: CapabilityName): CapabilityHandler | undefined;
export declare function registeredCapabilities(): CapabilityName[];
/**
 * Run a full or partial intelligence cycle.
 * Each capability receives the shared context enriched with prior outputs.
 * Failures are captured without aborting subsequent capabilities.
 */
export declare function runIntelligenceCycle(ctx: IntelligenceContext, capabilities?: CapabilityName[]): Promise<CycleResult>;
//# sourceMappingURL=index.d.ts.map