export interface ReasoningInput {
    question: string;
    domain: string;
    evidence: Record<string, unknown>;
    constraints?: string[];
    projectId?: string;
    userId?: string;
}
export type Confidence = "high" | "medium" | "low";
export type RiskSeverity = "critical" | "high" | "medium" | "low";
export type RiskLikelihood = "certain" | "likely" | "possible" | "unlikely";
export interface InferenceResult {
    inferenceId: string;
    question: string;
    conclusion: string;
    supportingReasons: string[];
    confidence: Confidence;
    alternativeConclusions: string[];
    generatedAt: string;
}
export interface DecisionOption {
    id: string;
    label: string;
    rationale: string;
    tradeoffs: string[];
    confidence: Confidence;
}
export interface DecisionResult {
    decisionId: string;
    question: string;
    options: DecisionOption[];
    recommended: string;
    reasoning: string;
    generatedAt: string;
}
export interface Opportunity {
    opportunityId: string;
    title: string;
    description: string;
    category: string;
    impactScore: number;
    effortScore: number;
    evidence: string[];
    detectedAt: string;
}
export interface Risk {
    riskId: string;
    title: string;
    description: string;
    severity: RiskSeverity;
    likelihood: RiskLikelihood;
    mitigations: string[];
    owner?: string;
}
export interface RiskAnalysis {
    analysisId: string;
    contextSummary: string;
    risks: Risk[];
    overallLevel: RiskSeverity;
    generatedAt: string;
}
export declare function infer(input: ReasoningInput): Promise<InferenceResult>;
export declare function supportDecision(input: ReasoningInput): Promise<DecisionResult>;
export declare function detectOpportunities(input: ReasoningInput): Promise<Opportunity[]>;
export declare function analyseRisks(input: ReasoningInput): Promise<RiskAnalysis>;
//# sourceMappingURL=index.d.ts.map