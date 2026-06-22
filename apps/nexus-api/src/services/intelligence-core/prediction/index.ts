// ---------------------------------------------------------------------------
// Intelligence Core — Prediction
// Forecasting, trend extrapolation, and scenario probability estimation.
// ---------------------------------------------------------------------------

import { logInfo } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  strength: number;  // 0-100
  relevanceScore: number;  // 0-100
  evidence: string[];
  detectedAt: string;
}

export interface ScenarioProbability {
  scenarioId: string;
  title: string;
  description: string;
  probability: number;  // 0-1
  impact: "positive" | "neutral" | "negative";
  impactScore: number;
  keyConditions: string[];
}

// ---------------------------------------------------------------------------
// Forecasting (stub — replace with time-series model or LLM)
// ---------------------------------------------------------------------------

export async function forecast(input: PredictionInput): Promise<Prediction> {
  logInfo("prediction_forecast", { subject: input.subject, domain: input.domain, horizon: input.horizon });

  const periods = horizonToPeriods(input.horizon);
  const forecastPoints: ForecastPoint[] = periods.map((period, i) => ({
    period,
    value: 100 + i * 12,
    unit: "index",
    lowerBound: 100 + i * 8,
    upperBound: 100 + i * 16,
  }));

  return {
    predictionId: `pred-${Date.now()}`,
    subject: input.subject,
    domain: input.domain,
    horizon: input.horizon,
    forecast: forecastPoints,
    keyDrivers: ["Current trajectory", "Domain context", "Historical patterns"],
    assumptions: ["No major disruptions", "Current resource levels maintained"],
    confidence: "medium",
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Trend detection (stub — replace with LLM + analytics data)
// ---------------------------------------------------------------------------

export async function detectTrends(domain: string): Promise<TrendSignal[]> {
  logInfo("prediction_trend_detection", { domain });
  return [
    {
      trendId: `trend-${Date.now()}-1`,
      name: `Increasing engagement in ${domain}`,
      direction: "rising",
      strength: 65,
      relevanceScore: 78,
      evidence: ["Usage data trend", "User feedback patterns"],
      detectedAt: new Date().toISOString(),
    },
    {
      trendId: `trend-${Date.now()}-2`,
      name: `Declining manual workflow usage`,
      direction: "falling",
      strength: 45,
      relevanceScore: 60,
      evidence: ["Automation adoption signals"],
      detectedAt: new Date().toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Scenario probability (stub — replace with Monte Carlo / LLM)
// ---------------------------------------------------------------------------

export async function estimateScenarioProbabilities(
  input: PredictionInput
): Promise<ScenarioProbability[]> {
  logInfo("prediction_scenario_probabilities", { subject: input.subject });
  return [
    {
      scenarioId: `scen-${Date.now()}-optimistic`,
      title: "Optimistic: accelerated growth",
      description: "All key drivers perform above baseline expectations.",
      probability: 0.25,
      impact: "positive",
      impactScore: 85,
      keyConditions: ["Strong market demand", "Adequate resources"],
    },
    {
      scenarioId: `scen-${Date.now()}-base`,
      title: "Base: steady progress",
      description: "Key drivers perform in line with current trajectory.",
      probability: 0.55,
      impact: "positive",
      impactScore: 60,
      keyConditions: ["Stable operating environment"],
    },
    {
      scenarioId: `scen-${Date.now()}-pessimistic`,
      title: "Pessimistic: headwinds",
      description: "One or more key drivers underperform.",
      probability: 0.20,
      impact: "negative",
      impactScore: 40,
      keyConditions: ["Resource constraints", "Market friction"],
    },
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function horizonToPeriods(horizon: PredictionHorizon): string[] {
  switch (horizon) {
    case "short_term": return ["Week 1", "Week 2", "Week 3", "Week 4"];
    case "medium_term": return ["Month 1", "Month 2", "Month 3", "Q2", "Q3"];
    case "long_term": return ["Q1", "Q2", "Q3", "Q4", "Year 2", "Year 3"];
  }
}
