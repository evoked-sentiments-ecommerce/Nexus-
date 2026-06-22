export const NEXUS_PREDICTION_TYPES = [
  "Revenue",
  "Profitability",
  "Cash Flow",
  "Customer Acquisition",
  "Customer Retention",
  "Marketing Performance",
  "Hiring Demand",
  "Operational Efficiency",
  "Project Success Probability",
  "Growth Potential",
  "Risk Exposure",
] as const;

export const CHEF_DREW_PREDICTION_TYPES = [
  "Food Cost",
  "Labor Cost",
  "Prime Cost",
  "Inventory Demand",
  "Vendor Demand",
  "Menu Performance",
  "Guest Demand",
  "Revenue Per Cover",
  "Training Impact",
  "Operational Efficiency",
  "Waste Levels",
] as const;

export type NexusPredictionType = (typeof NEXUS_PREDICTION_TYPES)[number];
export type ChefDrewPredictionType = (typeof CHEF_DREW_PREDICTION_TYPES)[number];
export type PredictionType = NexusPredictionType | ChefDrewPredictionType;

export type PredictionDomain = "nexus_business" | "chef_drew";
export type ForecastUnit = "day" | "week" | "month" | "quarter" | "year";
export type PredictionModel =
  | "prediction_engine"
  | "revenue_predictor"
  | "cost_predictor"
  | "growth_predictor"
  | "risk_predictor"
  | "demand_predictor";

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

export function parsePredictionDomain(value: unknown, predictionType?: string): PredictionDomain {
  if (value === "chef_drew" || (typeof predictionType === "string" && CHEF_DREW_PREDICTION_TYPES.includes(predictionType as ChefDrewPredictionType))) {
    return "chef_drew";
  }

  return "nexus_business";
}

export function parsePredictionType(value: unknown, domain?: PredictionDomain): PredictionType {
  if (typeof value === "string") {
    if (NEXUS_PREDICTION_TYPES.includes(value as NexusPredictionType)) {
      return value as NexusPredictionType;
    }

    if (CHEF_DREW_PREDICTION_TYPES.includes(value as ChefDrewPredictionType)) {
      return value as ChefDrewPredictionType;
    }
  }

  return domain === "chef_drew" ? "Prime Cost" : "Revenue";
}

export function parsePredictionModel(value: unknown, predictionType: PredictionType): PredictionModel {
  if (
    value === "prediction_engine" ||
    value === "revenue_predictor" ||
    value === "cost_predictor" ||
    value === "growth_predictor" ||
    value === "risk_predictor" ||
    value === "demand_predictor"
  ) {
    return value;
  }

  if (predictionType.includes("Revenue")) return "revenue_predictor";
  if (predictionType.includes("Cost") || predictionType === "Waste Levels") return "cost_predictor";
  if (
    predictionType === "Customer Acquisition" ||
    predictionType === "Customer Retention" ||
    predictionType === "Growth Potential" ||
    predictionType === "Hiring Demand" ||
    predictionType === "Training Impact"
  ) {
    return "growth_predictor";
  }
  if (
    predictionType === "Inventory Demand" ||
    predictionType === "Vendor Demand" ||
    predictionType === "Guest Demand"
  ) {
    return "demand_predictor";
  }
  if (
    predictionType === "Risk Exposure" ||
    predictionType === "Project Success Probability"
  ) {
    return "risk_predictor";
  }

  return "prediction_engine";
}

export function parseForecastUnit(value: unknown): ForecastUnit {
  if (
    value === "day" ||
    value === "week" ||
    value === "month" ||
    value === "quarter" ||
    value === "year"
  ) {
    return value;
  }

  return "month";
}
