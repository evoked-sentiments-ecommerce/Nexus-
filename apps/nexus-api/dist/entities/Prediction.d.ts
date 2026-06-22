export declare const NEXUS_BUSINESS_PREDICTION_TARGETS: readonly ["Revenue", "Profitability", "Cash Flow", "Customer Growth", "Marketing Performance", "Hiring Needs", "Operational Efficiency", "Project Success Probability", "Business Risk", "Market Opportunity"];
export declare const CHEF_DREW_PREDICTION_TARGETS: readonly ["Food Cost", "Labor Cost", "Prime Cost", "Menu Performance", "Inventory Demand", "Purchasing Demand", "Waste Levels", "Guest Demand", "Staffing Demand", "Training Impact", "Revenue Per Cover", "Forecast Accuracy"];
export type NexusBusinessPredictionTarget = (typeof NEXUS_BUSINESS_PREDICTION_TARGETS)[number];
export type ChefDrewPredictionTarget = (typeof CHEF_DREW_PREDICTION_TARGETS)[number];
export type PredictionTarget = NexusBusinessPredictionTarget | ChefDrewPredictionTarget;
export type PredictionScope = "nexus_business" | "chef_drew";
export interface PredictionInput {
    baselineValue: number;
    projectedChangePct: number;
    horizonPeriods: number;
    periodUnit: "day" | "week" | "month" | "quarter" | "year";
    volatilityPct: number;
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
export interface Prediction {
    id: string;
    title: string;
    scope: PredictionScope;
    target: PredictionTarget;
    requestedBy: string | null;
    input: PredictionInput;
    metrics: PredictionMetric[];
    risks: PredictionRisk[];
    recommendations: string[];
    confidence: number;
    createdAt: string;
    updatedAt: string;
    actualOutcome: number | null;
    accuracyScore: number | null;
}
export declare function parsePredictionScope(value: unknown): PredictionScope;
export declare function parsePredictionTarget(value: unknown, scope: PredictionScope): PredictionTarget;
//# sourceMappingURL=Prediction.d.ts.map