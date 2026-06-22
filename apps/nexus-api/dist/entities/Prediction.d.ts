export declare const NEXUS_PREDICTION_TYPES: readonly ["Revenue", "Profitability", "Cash Flow", "Customer Acquisition", "Customer Retention", "Marketing Performance", "Hiring Demand", "Operational Efficiency", "Project Success Probability", "Growth Potential", "Risk Exposure"];
export declare const CHEF_DREW_PREDICTION_TYPES: readonly ["Food Cost", "Labor Cost", "Prime Cost", "Inventory Demand", "Vendor Demand", "Menu Performance", "Guest Demand", "Revenue Per Cover", "Training Impact", "Operational Efficiency", "Waste Levels"];
export type NexusPredictionType = (typeof NEXUS_PREDICTION_TYPES)[number];
export type ChefDrewPredictionType = (typeof CHEF_DREW_PREDICTION_TYPES)[number];
export type PredictionType = NexusPredictionType | ChefDrewPredictionType;
export type PredictionDomain = "nexus_business" | "chef_drew";
export type ForecastUnit = "day" | "week" | "month" | "quarter" | "year";
export type PredictionModel = "prediction_engine" | "revenue_predictor" | "cost_predictor" | "growth_predictor" | "risk_predictor" | "demand_predictor";
export interface ForecastPeriod {
    periods: number;
    unit: ForecastUnit;
}
export interface PredictionInputData {
    baselineValue: number;
    projectedChangePct: number;
    volatilityPct: number;
    domain: PredictionDomain;
    assumptions: string[];
    drivers: Record<string, number>;
    context: Record<string, unknown>;
}
export interface PredictionMetric {
    name: string;
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
}
export interface PredictionRisk {
    title: string;
    level: "low" | "medium" | "high";
    probabilityPct: number;
    mitigation: string;
}
export interface PredictedOutcome {
    primaryMetric: string;
    forecastValue: number;
    forecastChangePct: number;
    lowerBound: number;
    upperBound: number;
    confidenceScore: number;
    metrics: PredictionMetric[];
    risks: PredictionRisk[];
    assumptions: string[];
    recommendations: string[];
    expectedCosts: number;
    expectedReturns: number;
    expectedOutcomes: string[];
    growthPotential: number;
}
export interface Prediction {
    id: string;
    goalId: string | null;
    projectId: string | null;
    predictionType: PredictionType;
    predictionModel: PredictionModel;
    forecastPeriod: ForecastPeriod;
    inputData: PredictionInputData;
    predictedOutcome: PredictedOutcome;
    confidenceScore: number;
    actualOutcome: Record<string, unknown> | null;
    accuracyScore: number | null;
    createdAt: string;
    updatedAt: string;
}
export declare function parsePredictionDomain(value: unknown, predictionType?: string): PredictionDomain;
export declare function parsePredictionType(value: unknown, domain?: PredictionDomain): PredictionType;
export declare function parsePredictionModel(value: unknown, predictionType: PredictionType): PredictionModel;
export declare function parseForecastUnit(value: unknown): ForecastUnit;
//# sourceMappingURL=Prediction.d.ts.map