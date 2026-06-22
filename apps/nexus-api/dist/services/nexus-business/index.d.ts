export type BusinessDomain = "strategy" | "finance" | "hr" | "marketing" | "technology" | "operations";
export interface BusinessContext {
    companyName: string;
    industry: string;
    stage: "idea" | "pre_seed" | "seed" | "series_a" | "series_b" | "growth" | "mature";
    teamSize: number;
    currentRevenue?: number;
    targetRevenue?: number;
    geography: string[];
    objectives: string[];
}
export interface BusinessPlan {
    planId: string;
    companyName: string;
    executiveSummary: string;
    vision: string;
    mission: string;
    coreValues: string[];
    marketOpportunity: string;
    competitiveAdvantage: string;
    revenueModel: string;
    goToMarketStrategy: string;
    operationalPlan: string;
    financialHighlights: string;
    riskFactors: string[];
    generatedAt: string;
}
export interface StrategicPlan {
    planId: string;
    timeHorizon: string;
    strategicPillars: StrategicPillar[];
    keyInitiatives: string[];
    successMetrics: string[];
    generatedAt: string;
}
export interface StrategicPillar {
    name: string;
    description: string;
    objectives: string[];
    keyResults: string[];
}
export interface FinancialModel {
    modelId: string;
    companyName: string;
    period: string;
    revenueProjections: Record<string, number>;
    costProjections: Record<string, number>;
    ebitdaProjections: Record<string, number>;
    cashFlowProjections: Record<string, number>;
    keyAssumptions: string[];
    scenarios: string[];
    generatedAt: string;
}
export interface InvestorDeck {
    deckId: string;
    companyName: string;
    slides: DeckSlide[];
    askAmount?: number;
    valuation?: number;
    generatedAt: string;
}
export interface DeckSlide {
    order: number;
    title: string;
    content: string;
    visualSuggestion?: string;
}
export interface HiringPlan {
    planId: string;
    companyName: string;
    period: string;
    roles: HiringRole[];
    totalHeadcount: number;
    estimatedLaborCost: number;
    generatedAt: string;
}
export interface HiringRole {
    roleId: string;
    title: string;
    department: string;
    level: "junior" | "mid" | "senior" | "lead" | "executive";
    priority: "critical" | "high" | "medium" | "low";
    targetStartDate?: string;
    estimatedSalary?: number;
    responsibilities: string[];
    requiredSkills: string[];
}
export interface MarketingPlan {
    planId: string;
    companyName: string;
    period: string;
    targetSegments: string[];
    channels: MarketingChannel[];
    budget: number;
    kpis: Record<string, number>;
    campaigns: CampaignBrief[];
    generatedAt: string;
}
export interface MarketingChannel {
    name: string;
    budgetAllocation: number;
    expectedReach: number;
    primaryObjective: string;
}
export interface CampaignBrief {
    campaignId: string;
    name: string;
    objective: string;
    audience: string;
    channels: string[];
    messaging: string;
    callToAction: string;
    budget: number;
    duration: string;
}
export interface OperationalFramework {
    frameworkId: string;
    companyName: string;
    coreProcesses: OperationalProcess[];
    kpis: Record<string, string>;
    technologyStack: string[];
    generatedAt: string;
}
export interface OperationalProcess {
    processId: string;
    name: string;
    description: string;
    owner: string;
    inputs: string[];
    outputs: string[];
    steps: string[];
    frequency: string;
    tools: string[];
}
export declare function generateBusinessPlan(ctx: BusinessContext): Promise<BusinessPlan>;
export declare function generateStrategicPlan(ctx: BusinessContext, timeHorizonYears?: number): Promise<StrategicPlan>;
export declare function generateFinancialModel(ctx: BusinessContext, periods?: number): Promise<FinancialModel>;
export declare function generateInvestorDeck(ctx: BusinessContext, askAmount?: number): Promise<InvestorDeck>;
export declare function generateHiringPlan(ctx: BusinessContext, roles: Omit<HiringRole, "roleId">[]): Promise<HiringPlan>;
export declare function generateMarketingPlan(ctx: BusinessContext, budget: number): Promise<MarketingPlan>;
export declare function generateOperationalFramework(ctx: BusinessContext): Promise<OperationalFramework>;
//# sourceMappingURL=index.d.ts.map