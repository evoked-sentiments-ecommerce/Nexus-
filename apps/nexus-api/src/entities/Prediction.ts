export const NEXUS_BUSINESS_PREDICTION_TARGETS = [
  "Revenue",
  "Profitability",
  "Cash Flow",
  "Customer Growth",
  "Marketing Performance",
  "Hiring Needs",
  "Operational Efficiency",
  "Project Success Probability",
  "Business Risk",
  "Market Opportunity",
] as const;

export const CHEF_DREW_PREDICTION_TARGETS = [
  "Food Cost",
  "Labor Cost",
  "Prime Cost",
  "Menu Performance",
  "Inventory Demand",
  "Purchasing Demand",
  "Waste Levels",
  "Guest Demand",
  "Staffing Demand",
  "Training Impact",
  "Revenue Per Cover",
  "Forecast Accuracy",
] as const;

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

export function parsePredictionScope(value: unknown): PredictionScope {
  if (value === "chef_drew") {
    return "chef_drew";
  }

  return "nexus_business";
}

export function parsePredictionTarget(value: unknown, scope: PredictionScope): PredictionTarget {
  if (typeof value !== "string") {
    return scope === "chef_drew" ? "Prime Cost" : "Revenue";
  }

  if (
    NEXUS_BUSINESS_PREDICTION_TARGETS.includes(
      value as NexusBusinessPredictionTarget
    )
  ) {
    return value as NexusBusinessPredictionTarget;
  }

  if (
    CHEF_DREW_PREDICTION_TARGETS.includes(
      value as ChefDrewPredictionTarget
    )
  ) {
    return value as ChefDrewPredictionTarget;
  }

  return scope === "chef_drew" ? "Prime Cost" : "Revenue";
}
