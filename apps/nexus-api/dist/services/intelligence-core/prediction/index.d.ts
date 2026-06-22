export type PredictionHorizon = "short_term" | "medium_term" | "long_term";
export type ConfidenceLevel = "high" | "medium" | "low";
export interface PredictionInput {
    subject: string;
    domain: string;
    currentState: Record<string, unknown>;
    horizon: PredictionHorizon;
    contextualFactors?: string[];
}
export interface ForecastPoint {
    period: string;
    value: number;
    unit: string;
    lowerBound: number;
    upperBound: number;
}
export interface Prediction {
    predictionId: string;
    subject: string;
    domain: string;
    horizon: PredictionHorizon;
    forecast: ForecastPoint[];
    keyDrivers: string[];
    assumptions: string[];
    confidence: ConfidenceLevel;
    generatedAt: string;
}
export interface TrendSignal {
    trendId: string;
    name: string;
    direction: "rising" | "falling" | "stable" | "volatile";
    strength: number;
    relevanceScore: number;
    evidence: string[];
    detectedAt: string;
}
export interface ScenarioProbability {
    scenarioId: string;
    title: string;
    description: string;
    probability: number;
    impact: "positive" | "neutral" | "negative";
    impactScore: number;
    keyConditions: string[];
}
export declare function forecast(input: PredictionInput): Promise<Prediction>;
export declare function detectTrends(domain: string): Promise<TrendSignal[]>;
export declare function estimateScenarioProbabilities(input: PredictionInput): Promise<ScenarioProbability[]>;
//# sourceMappingURL=index.d.ts.map