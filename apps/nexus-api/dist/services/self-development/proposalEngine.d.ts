import { CapabilityGapReport } from "../capability-discovery/registry";
export interface EvolutionProposal {
    id?: string;
    gapReportId: string;
    title: string;
    description: string;
    category: string;
    status: "pending" | "approved" | "rejected" | "implemented";
    impactScore: number;
    priorityScore: number;
    effortScore: number;
}
export interface EvolutionCycleSummary {
    reportId: string;
    proposalsCreated: number;
    highPriorityCount: number;
    generatedAt: string;
}
export declare function generateCapabilityGapReport(period?: string): Promise<CapabilityGapReport>;
export declare function convertGapsToProposals(gapReport: CapabilityGapReport): Promise<EvolutionProposal[]>;
export declare function runEvolutionCycle(): Promise<EvolutionCycleSummary>;
//# sourceMappingURL=proposalEngine.d.ts.map