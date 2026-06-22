export interface ReasoningContext {
    projectId?: string;
    userId?: string;
    domain: string;
    inputs: Record<string, unknown>;
}
export type DecisionConfidence = "high" | "medium" | "low";
export interface DecisionOption {
    id: string;
    label: string;
    rationale: string;
    tradeoffs: string[];
    confidence: DecisionConfidence;
}
export interface DecisionSupportResult {
    question: string;
    options: DecisionOption[];
    recommended: string;
    reasoning: string;
}
export interface Opportunity {
    id: string;
    title: string;
    description: string;
    impactScore: number;
    effortScore: number;
    category: string;
    evidence: string[];
}
export type RiskSeverity = "critical" | "high" | "medium" | "low";
export type RiskLikelihood = "certain" | "likely" | "possible" | "unlikely";
export interface Risk {
    id: string;
    title: string;
    description: string;
    severity: RiskSeverity;
    likelihood: RiskLikelihood;
    mitigations: string[];
    owner?: string;
}
export interface RiskAnalysisResult {
    contextSummary: string;
    risks: Risk[];
    overallRiskLevel: RiskSeverity;
}
/**
 * Provide structured decision support for a question in the given context.
 *
 * Replace the stub body with an LLM call (e.g. chain-of-thought prompting)
 * or a rule-based decision engine.
 */
export declare function supportDecision(question: string, ctx: ReasoningContext): Promise<DecisionSupportResult>;
/**
 * Detect actionable opportunities in the given reasoning context.
 *
 * Replace the stub body with an LLM call or pattern-matching engine that
 * analyses project data, market signals, and platform usage.
 */
export declare function detectOpportunities(ctx: ReasoningContext): Promise<Opportunity[]>;
/**
 * Analyse risks in the given context and return a structured risk register.
 *
 * Replace the stub body with an LLM call or rule-based risk engine.
 */
export declare function analyseRisks(ctx: ReasoningContext): Promise<RiskAnalysisResult>;
//# sourceMappingURL=index.d.ts.map