export interface UsageMetric {
    feature: string;
    eventCount: number;
    uniqueUsers: number;
    avgSessionsPerUser: number;
    period: string;
}
export interface UsageAnalysis {
    analysisId: string;
    period: string;
    topFeatures: UsageMetric[];
    underusedFeatures: UsageMetric[];
    dropOffPoints: string[];
    engagementScore: number;
    generatedAt: string;
}
export type ProposalPriority = "critical" | "high" | "medium" | "low";
export type ProposalCategory = "performance" | "usability" | "new_feature" | "deprecation" | "infrastructure" | "security";
export interface ImprovementProposal {
    proposalId: string;
    title: string;
    description: string;
    category: ProposalCategory;
    priority: ProposalPriority;
    expectedImpact: string;
    effortEstimate: "small" | "medium" | "large" | "x-large";
    evidence: string[];
    generatedAt: string;
}
export interface DevelopmentRecommendation {
    recommendationId: string;
    title: string;
    description: string;
    rationale: string;
    area: "frontend" | "backend" | "infrastructure" | "data" | "ai" | "integrations";
    priority: ProposalPriority;
    linkedProposals: string[];
    generatedAt: string;
}
/**
 * Analyse platform usage data for a given time period.
 *
 * In production, pull event data from PostHog, Mixpanel, or a data warehouse.
 * Replace the stub body with real analytics queries.
 */
export declare function analyseUsage(period?: string): Promise<UsageAnalysis>;
/**
 * Generate platform improvement proposals derived from usage analysis.
 *
 * Replace the stub body with an LLM call that reasons over usage data,
 * feedback, and signals to produce prioritised, evidence-backed proposals.
 */
export declare function generateProposals(analysis: UsageAnalysis): Promise<ImprovementProposal[]>;
/**
 * Translate improvement proposals into concrete development recommendations.
 *
 * Replace the stub body with an LLM call that maps proposals to engineering
 * tasks, architecture decisions, or roadmap items.
 */
export declare function generateRecommendations(proposals: ImprovementProposal[]): Promise<DevelopmentRecommendation[]>;
export interface EvolutionReport {
    reportId: string;
    period: string;
    usageAnalysis: UsageAnalysis;
    proposals: ImprovementProposal[];
    recommendations: DevelopmentRecommendation[];
    generatedAt: string;
}
/**
 * Run the complete evolution pipeline:
 *   usage analysis → proposals → recommendations → EvolutionReport
 */
export declare function buildEvolutionReport(period?: string): Promise<EvolutionReport>;
//# sourceMappingURL=index.d.ts.map