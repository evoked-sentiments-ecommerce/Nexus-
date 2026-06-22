"use strict";
// ---------------------------------------------------------------------------
// Simulation Engine — revenue, cost, labour, hospitality, business,
// marketing, and growth simulation with scenarios and recommendations.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulation = runSimulation;
exports.simulateRevenue = simulateRevenue;
exports.simulateCosts = simulateCosts;
exports.simulateLabor = simulateLabor;
exports.simulateHospitality = simulateHospitality;
exports.simulateGrowth = simulateGrowth;
const logger_1 = require("../logger");
// ---------------------------------------------------------------------------
// Core simulation engine (stub — replace with Monte Carlo / agent model)
// ---------------------------------------------------------------------------
async function runSimulation(request) {
    (0, logger_1.logInfo)("simulation_started", { requestId: request.requestId, mode: request.mode, periods: request.periods });
    const scenarios = request.scenarios.map((s, idx) => buildScenario(s, idx, request));
    const predictions = derivePredictions(scenarios, request.mode);
    const recommendations = buildRecommendations(request.mode, predictions);
    const result = {
        simulationId: `sim-${request.mode}-${Date.now()}`,
        requestId: request.requestId,
        mode: request.mode,
        title: request.title,
        scenarios,
        predictions,
        recommendations,
        generatedAt: new Date().toISOString(),
    };
    (0, logger_1.logInfo)("simulation_completed", { simulationId: result.simulationId, scenarioCount: scenarios.length });
    return result;
}
// ---------------------------------------------------------------------------
// Domain-specific convenience functions
// ---------------------------------------------------------------------------
async function simulateRevenue(baseRevenue, periods, periodUnit = "month") {
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
async function simulateCosts(baseCost, costBreakdown, periods) {
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
async function simulateLabor(headcount, avgWage, periods) {
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
async function simulateHospitality(coversPerDay, avgSpend, foodCostPct, laborCostPct, periods) {
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
async function simulateGrowth(baseMetric, metricName, periods) {
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
function buildScenario(input, idx, request) {
    const multiplier = [1.15, 1.0, 0.85][idx] ?? 1.0;
    const periods = Array.from({ length: request.periods }, (_, p) => ({
        label: `${request.periodUnit.charAt(0).toUpperCase()}${request.periodUnit.slice(1)} ${p + 1}`,
        index: p + 1,
        values: Object.fromEntries(Object.entries(request.baselineValues).map(([k, v]) => [k, v * multiplier * (1 + p * 0.015)])),
    }));
    const totals = Object.fromEntries(Object.keys(request.baselineValues).map((k) => [k, periods.reduce((s, p) => s + (p.values[k] ?? 0), 0)]));
    const peakValues = Object.fromEntries(Object.keys(request.baselineValues).map((k) => [k, Math.max(...periods.map((p) => p.values[k] ?? 0))]));
    const troughValues = Object.fromEntries(Object.keys(request.baselineValues).map((k) => [k, Math.min(...periods.map((p) => p.values[k] ?? 0))]));
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
function derivePredictions(scenarios, mode) {
    const base = scenarios.find((s) => s.name === "Base Case") ?? scenarios[1] ?? scenarios[0];
    if (!base)
        return {};
    return { ...base.totals, _mode: modeIndex(mode) };
}
function modeIndex(mode) {
    return ["revenue", "cost", "labor", "hospitality", "business", "marketing", "growth"].indexOf(mode);
}
function buildRecommendations(mode, predictions) {
    const recs = [`Monitor ${mode} KPIs against base-case projections each ${mode === "revenue" ? "month" : "period"}.`];
    if (predictions._mode === 0)
        recs.push("Prioritise customer acquisition to sustain revenue trajectory.");
    if (predictions._mode === 1)
        recs.push("Review largest cost centres for optimisation opportunities.");
    if (predictions._mode === 2)
        recs.push("Consider automation to reduce labour cost growth.");
    recs.push("Review pessimistic scenario mitigations to reduce downside exposure.");
    return recs;
}
//# sourceMappingURL=index.js.map