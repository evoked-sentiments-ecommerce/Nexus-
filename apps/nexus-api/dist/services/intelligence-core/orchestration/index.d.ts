export interface OrchestrationRequest {
    requestId: string;
    objective: string;
    userId?: string;
    projectId?: string;
    context?: Record<string, unknown>;
    autonomyLevel: "supervised" | "semi_autonomous" | "autonomous";
}
export interface OrchestrationPlan {
    planId: string;
    requestId: string;
    phases: OrchestrationPhase[];
    estimatedCycles: number;
    createdAt: string;
}
export interface OrchestrationPhase {
    phaseId: string;
    name: string;
    description: string;
    capabilities: string[];
    order: number;
    dependsOn: string[];
}
export interface OrchestrationResult {
    requestId: string;
    planId: string;
    cyclesExecuted: number;
    outputs: unknown[];
    finalState: Record<string, unknown>;
    completedAt: string;
    durationMs: number;
}
export declare function planOrchestration(request: OrchestrationRequest): Promise<OrchestrationPlan>;
/**
 * Execute a full orchestration plan, running each phase as an intelligence
 * cycle and collecting outputs across all phases.
 */
export declare function executeOrchestration(request: OrchestrationRequest, plan: OrchestrationPlan): Promise<OrchestrationResult>;
export declare function orchestrate(request: OrchestrationRequest): Promise<OrchestrationResult>;
//# sourceMappingURL=index.d.ts.map