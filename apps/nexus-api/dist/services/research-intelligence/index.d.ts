export type ResearchDomain = "market" | "competitive" | "trend" | "industry" | "opportunity" | "risk" | "technology" | "regulatory";
export interface ResearchQuery {
    queryId: string;
    domain: ResearchDomain;
    topic: string;
    scope: string;
    depth: "surface" | "standard" | "deep";
    projectId?: string;
    requestedBy?: string;
}
export interface ResearchFinding {
    findingId: string;
    queryId: string;
    domain: ResearchDomain;
    topic: string;
    summary: string;
    details: string;
    sources: string[];
    confidence: "high" | "medium" | "low";
    relevanceScore: number;
    discoveredAt: string;
}
export interface KnowledgeEntry {
    entryId: string;
    domain: ResearchDomain;
    topic: string;
    content: string;
    tags: string[];
    sourceFindings: string[];
    createdAt: string;
    updatedAt: string;
    version: number;
}
export interface CompetitorProfile {
    competitorId: string;
    name: string;
    domain: string;
    strengths: string[];
    weaknesses: string[];
    keyOfferings: string[];
    marketPosition: string;
    threatLevel: "high" | "medium" | "low";
    analysedAt: string;
}
export interface TrendReport {
    trendId: string;
    name: string;
    domain: string;
    direction: "emerging" | "accelerating" | "maturing" | "declining";
    timeframe: string;
    relevanceScore: number;
    implicationsForNexus: string[];
    implicationsForChefDrew: string[];
    capturedAt: string;
}
export interface OpportunityReport {
    opportunityId: string;
    title: string;
    domain: ResearchDomain;
    description: string;
    marketSize?: string;
    addressableSegment?: string;
    impactScore: number;
    urgencyScore: number;
    evidence: string[];
    detectedAt: string;
}
export interface RiskReport {
    riskId: string;
    title: string;
    domain: ResearchDomain;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    likelihood: "certain" | "likely" | "possible" | "unlikely";
    mitigations: string[];
    detectedAt: string;
}
export declare function storeKnowledge(entry: Omit<KnowledgeEntry, "entryId" | "createdAt" | "updatedAt" | "version">): Promise<KnowledgeEntry>;
export declare function searchKnowledge(domain?: ResearchDomain, tags?: string[]): Promise<KnowledgeEntry[]>;
export declare function conductMarketResearch(query: ResearchQuery): Promise<ResearchFinding[]>;
export declare function analyseCompetitor(competitorName: string, domain: string): Promise<CompetitorProfile>;
export declare function analyseTrends(domain: string): Promise<TrendReport[]>;
export declare function detectOpportunities(domain: string): Promise<OpportunityReport[]>;
export declare function detectRisks(domain: string): Promise<RiskReport[]>;
//# sourceMappingURL=index.d.ts.map