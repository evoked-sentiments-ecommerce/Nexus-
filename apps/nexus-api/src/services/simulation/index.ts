// ---------------------------------------------------------------------------
// Simulation Engine — revenue, cost, labour, hospitality, business,
// marketing, and growth simulation with scenarios and recommendations.
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SimulationMode =
  | "revenue"
  | "cost"
  | "labor"
  | "hospitality"
  | "business"
  | "marketing"
  | "growth";

export interface ScenarioInput {
  name: string;
  description: string;
  assumptions: Record<string, number | string>;
}

export interface SimulationRequest {
  requestId: string;
  mode: SimulationMode;
  title: string;
  baselineValues: Record<string, number>;
  scenarios: ScenarioInput[];
  periods: number;
  periodUnit: "day" | "week" | "month" | "quarter" | "year";
  requestedBy?: string;
}

export interface SimulationPeriod {
  label: string;
  index: number;
  values: Record<string, number>;
}

export interface SimulationScenarioResult {
  scenarioId: string;
  name: string;
  description: string;
  assumptions: Record<string, number | string>;
  periods: SimulationPeriod[];
  totals: Record<string, number>;
  peakValues: Record<string, number>;
  troughValues: Record<string, number>;
}

export interface SimulationResult {
  simulationId: string;
  requestId: string;
  mode: SimulationMode;
  title: string;
  scenarios: SimulationScenarioResult[];
  predictions: Record<string, number>;
  recommendations: string[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Core simulation engine (stub — replace with Monte Carlo / agent model)
// ---------------------------------------------------------------------------

export async function runSimulation(request: SimulationRequest): Promise<SimulationResult> {
  logInfo("simulation_started", { requestId: request.requestId, mode: request.mode, periods: request.periods });

  const scenarios = request.scenarios.map((s, idx) => buildScenario(s, idx, request));
  const predictions = derivePredictions(scenarios, request.mode);
  const recommendations = buildRecommendations(request.mode, predictions);

  const result: SimulationResult = {
    simulationId: `sim-${request.mode}-${Date.now()}`,
    requestId: request.requestId,
    mode: request.mode,
    title: request.title,
    scenarios,
    predictions,
    recommendations,
    generatedAt: new Date().toISOString(),
  };

  logInfo("simulation_completed", { simulationId: result.simulationId, scenarioCount: scenarios.length });
  return result;
}

// ---------------------------------------------------------------------------
// Domain-specific convenience functions
// ---------------------------------------------------------------------------

export async function simulateRevenue(
  baseRevenue: number,
  periods: number,
  periodUnit: SimulationRequest["periodUnit"] = "month"
): Promise<SimulationResult> {
  return runSimulation({
    requestId: `req-rev-${Date.now()}`,
    mode: "revenue",
    title: "Revenue Simulation",
    baselineValues: { revenue: baseRevenue },
    scenarios: [
      { name: "Optimistic", description: "Strong growth trajectory", assumptions: { growthRate: 0.12, churnRate: 0.03 } },
      { name: "Base Case", description: "Steady growth", assumptions: { growthRate: 0.06, churnRate: 0.05 } },
      { name: "Pessimistic", description: "Headwinds", assumptions: { growthRate: 0.02, churnRate: 0.08 } },
    ],
    periods,
    periodUnit,
  });
}

export async function simulateCosts(
  baseCost: number,
  costBreakdown: Record<string, number>,
  periods: number
): Promise<SimulationResult> {
  return runSimulation({
    requestId: `req-cost-${Date.now()}`,
    mode: "cost",
    title: "Cost Simulation",
    baselineValues: { totalCost: baseCost, ...costBreakdown },
    scenarios: [
      { name: "Controlled", description: "Cost optimisation in effect", assumptions: { inflationRate: 0.02, efficiencyGain: 0.05 } },
      { name: "Baseline", description: "No change", assumptions: { inflationRate: 0.04, efficiencyGain: 0 } },
      { name: "Escalation", description: "Cost pressures increase", assumptions: { inflationRate: 0.08, efficiencyGain: -0.02 } },
    ],
    periods,
    periodUnit: "month",
  });
}

export async function simulateLabor(
  headcount: number,
  avgWage: number,
  periods: number
): Promise<SimulationResult> {
  return runSimulation({
    requestId: `req-labor-${Date.now()}`,
    mode: "labor",
    title: "Labour Cost Simulation",
    baselineValues: { headcount, avgWage, laborCost: headcount * avgWage },
    scenarios: [
      { name: "Growth", description: "Headcount scales with revenue", assumptions: { headcountGrowthRate: 0.08, wageInflation: 0.04 } },
      { name: "Stable", description: "Headcount maintained", assumptions: { headcountGrowthRate: 0, wageInflation: 0.03 } },
      { name: "Reduction", description: "Automation reduces headcount", assumptions: { headcountGrowthRate: -0.05, wageInflation: 0.03 } },
    ],
    periods,
    periodUnit: "month",
  });
}

export async function simulateHospitality(
  coversPerDay: number,
  avgSpend: number,
  foodCostPct: number,
  laborCostPct: number,
  periods: number
): Promise<SimulationResult> {
  const dailyRevenue = coversPerDay * avgSpend;
  return runSimulation({
    requestId: `req-hosp-${Date.now()}`,
    mode: "hospitality",
    title: "Hospitality Unit Economics Simulation",
    baselineValues: {
      coversPerDay,
      avgSpend,
      dailyRevenue,
      foodCostPct,
      laborCostPct,
      primeCostPct: foodCostPct + laborCostPct,
    },
    scenarios: [
      { name: "High Season", description: "Peak demand period", assumptions: { coverMultiplier: 1.4, spendMultiplier: 1.1 } },
      { name: "Baseline", description: "Average trading conditions", assumptions: { coverMultiplier: 1.0, spendMultiplier: 1.0 } },
      { name: "Low Season", description: "Off-peak period", assumptions: { coverMultiplier: 0.6, spendMultiplier: 0.95 } },
    ],
    periods,
    periodUnit: "month",
  });
}

export async function simulateGrowth(
  baseMetric: number,
  metricName: string,
  periods: number
): Promise<SimulationResult> {
  return runSimulation({
    requestId: `req-growth-${Date.now()}`,
    mode: "growth",
    title: `Growth Simulation — ${metricName}`,
    baselineValues: { [metricName]: baseMetric },
    scenarios: [
      { name: "Aggressive", description: "Accelerated growth investment", assumptions: { growthRate: 0.20 } },
      { name: "Moderate", description: "Balanced growth strategy", assumptions: { growthRate: 0.10 } },
      { name: "Conservative", description: "Organic growth only", assumptions: { growthRate: 0.04 } },
    ],
    periods,
    periodUnit: "quarter",
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildScenario(
  input: ScenarioInput,
  idx: number,
  request: SimulationRequest
): SimulationScenarioResult {
  const multiplier = [1.15, 1.0, 0.85][idx] ?? 1.0;
  const periods: SimulationPeriod[] = Array.from({ length: request.periods }, (_, p) => ({
    label: `${request.periodUnit.charAt(0).toUpperCase()}${request.periodUnit.slice(1)} ${p + 1}`,
    index: p + 1,
    values: Object.fromEntries(
      Object.entries(request.baselineValues).map(([k, v]) => [k, v * multiplier * (1 + p * 0.015)])
    ),
  }));

  const totals = Object.fromEntries(
    Object.keys(request.baselineValues).map((k) => [k, periods.reduce((s, p) => s + (p.values[k] ?? 0), 0)])
  );
  const peakValues = Object.fromEntries(
    Object.keys(request.baselineValues).map((k) => [k, Math.max(...periods.map((p) => p.values[k] ?? 0))])
  );
  const troughValues = Object.fromEntries(
    Object.keys(request.baselineValues).map((k) => [k, Math.min(...periods.map((p) => p.values[k] ?? 0))])
  );

  return {
    scenarioId: `scen-${input.name.toLowerCase().replace(/\s/g, "-")}-${Date.now()}`,
    name: input.name,
    description: input.description,
    assumptions: input.assumptions,
    periods,
    totals,
    peakValues,
    troughValues,
  };
}

function derivePredictions(
  scenarios: SimulationScenarioResult[],
  mode: SimulationMode
): Record<string, number> {
  const base = scenarios.find((s) => s.name === "Base Case") ?? scenarios[1] ?? scenarios[0];
  if (!base) return {};
  return { ...base.totals, _mode: modeIndex(mode) };
}

function modeIndex(mode: SimulationMode): number {
  return ["revenue", "cost", "labor", "hospitality", "business", "marketing", "growth"].indexOf(mode);
}

function buildRecommendations(mode: SimulationMode, predictions: Record<string, number>): string[] {
  const recs = [`Monitor ${mode} KPIs against base-case projections each ${mode === "revenue" ? "month" : "period"}.`];
  if (predictions._mode === 0) recs.push("Prioritise customer acquisition to sustain revenue trajectory.");
  if (predictions._mode === 1) recs.push("Review largest cost centres for optimisation opportunities.");
  if (predictions._mode === 2) recs.push("Consider automation to reduce labour cost growth.");
  recs.push("Review pessimistic scenario mitigations to reduce downside exposure.");
  return recs;
}
