export interface PerformanceSnapshot {
    snapshotId: string;
    period: string;
    apiLatencyP50Ms: number;
    apiLatencyP99Ms: number;
    errorRate: number;
    successRate: number;
    activeUsers: number;
    totalRequests: number;
    topSlowEndpoints: EndpointStat[];
    capturedAt: string;
}
export interface EndpointStat {
    path: string;
    method: string;
    avgLatencyMs: number;
    errorRate: number;
    callCount: number;
}
export interface UserBehaviourSnapshot {
    snapshotId: string;
    period: string;
    sessionCount: number;
    avgSessionDurationMs: number;
    topUserFlows: string[];
    dropOffPoints: string[];
    featureAdoptionRates: Record<string, number>;
    capturedAt: string;
}
export interface CapabilityUsageSnapshot {
    snapshotId: string;
    period: string;
    usageCounts: Record<string, number>;
    unusedCapabilities: string[];
    highValueCapabilities: string[];
    capturedAt: string;
}
export type ImprovementCategory = "performance" | "reliability" | "usability" | "feature" | "refactoring" | "security" | "scalability";
export interface ImprovementProposal {
    proposalId: string;
    category: ImprovementCategory;
    title: string;
    description: string;
    rationale: string;
    expectedOutcome: string;
    impactScore: number;
    effort: "trivial" | "small" | "medium" | "large";
    priority: "critical" | "high" | "medium" | "low";
    generatedAt: string;
}
export interface EnhancementPlan {
    planId: string;
    title: string;
    proposals: ImprovementProposal[];
    implementationOrder: string[];
    estimatedImpact: string;
    generatedAt: string;
}
export declare function analysePerformance(period?: string): Promise<PerformanceSnapshot>;
export declare function analyseUserBehaviour(period?: string): Promise<UserBehaviourSnapshot>;
export declare function analyseCapabilityUsage(period?: string): Promise<CapabilityUsageSnapshot>;
export declare function generateImprovementProposals(performance: PerformanceSnapshot, behaviour: UserBehaviourSnapshot, usage: CapabilityUsageSnapshot): Promise<ImprovementProposal[]>;
export declare function buildEnhancementPlan(proposals: ImprovementProposal[]): Promise<EnhancementPlan>;
export declare function runSelfDevelopmentCycle(period?: string): Promise<{
    performance: PerformanceSnapshot;
    behaviour: UserBehaviourSnapshot;
    usage: CapabilityUsageSnapshot;
    proposals: ImprovementProposal[];
    enhancementPlan: EnhancementPlan;
}>;
//# sourceMappingURL=index.d.ts.map