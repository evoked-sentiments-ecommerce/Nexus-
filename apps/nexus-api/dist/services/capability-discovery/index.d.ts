export type GapCategory = "capability" | "workflow" | "production" | "integration" | "analytics" | "automation";
export interface PlatformAssessment {
    assessmentId: string;
    currentCapabilities: string[];
    currentWorkflows: string[];
    currentProductionOutputs: string[];
    observedUserNeeds: string[];
    observedFailurePoints: string[];
    period: string;
    generatedAt: string;
}
export interface CapabilityGap {
    gapId: string;
    category: GapCategory;
    title: string;
    description: string;
    userImpact: string;
    frequency: "constant" | "frequent" | "occasional" | "rare";
    discoveredAt: string;
}
export interface ImplementationStep {
    order: number;
    title: string;
    description: string;
    effort: "small" | "medium" | "large";
    dependencies: string[];
}
export interface CapabilityProposal {
    proposalId: string;
    gapId: string;
    title: string;
    description: string;
    category: GapCategory;
    impactScore: number;
    priorityScore: number;
    effortScore: number;
    implementationPlan: ImplementationStep[];
    requiredIntegrations: string[];
    generatedAt: string;
}
export declare function assessPlatform(period?: string): Promise<PlatformAssessment>;
export declare function identifyGaps(assessment: PlatformAssessment): Promise<CapabilityGap[]>;
export declare function generateProposals(gaps: CapabilityGap[]): Promise<CapabilityProposal[]>;
export declare function runCapabilityDiscovery(period?: string): Promise<{
    assessment: PlatformAssessment;
    gaps: CapabilityGap[];
    proposals: CapabilityProposal[];
}>;
//# sourceMappingURL=index.d.ts.map