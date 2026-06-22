export interface PlatformSnapshot {
    snapshotId: string;
    period: string;
    capabilityUsage: Record<string, number>;
    userOutcomes: {
        success: number;
        partial: number;
        failure: number;
    };
    topObjectives: string[];
    unmetNeeds: string[];
    capturedAt: string;
}
export type EvolutionProposalType = "improvement" | "expansion" | "new_capability" | "optimization" | "deprecation";
export interface EvolutionProposal {
    proposalId: string;
    type: EvolutionProposalType;
    title: string;
    description: string;
    rationale: string;
    impactScore: number;
    priorityScore: number;
    effort: "small" | "medium" | "large" | "x-large";
    generatedAt: string;
}
export interface EvolutionReport {
    reportId: string;
    period: string;
    snapshot: PlatformSnapshot;
    proposals: EvolutionProposal[];
    topPriorities: string[];
    generatedAt: string;
}
export declare function captureSnapshot(period?: string): Promise<PlatformSnapshot>;
export declare function generateProposals(snapshot: PlatformSnapshot): Promise<EvolutionProposal[]>;
export declare function buildEvolutionReport(period?: string): Promise<EvolutionReport>;
//# sourceMappingURL=index.d.ts.map