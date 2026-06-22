"use strict";
// ---------------------------------------------------------------------------
// Intelligence Core — Simulation
// Model-based scenario simulation for business, hospitality, revenue, cost,
// labour, marketing, and growth contexts.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulation = runSimulation;
exports.simulateRevenue = simulateRevenue;
exports.simulateCosts = simulateCosts;
exports.simulateLabor = simulateLabor;
exports.simulateGrowth = simulateGrowth;
const logger_1 = require("../../logger");
// ---------------------------------------------------------------------------
// Run simulation (stub — replace with Monte Carlo engine or LLM)
// ---------------------------------------------------------------------------
async function runSimulation(params) {
    (0, logger_1.logInfo)("simulation_started", { domain: params.domain, periods: params.periods });
    const scenarios = buildScenarios(params);
    const predictions = aggregatePredictions(scenarios);
    const recommendations = generateRecommendations(params.domain, predictions);
    const output = {
        simulationId: `sim-${params.domain}-${Date.now()}`,
        domain: params.domain,
        scenarios,
        predictions,
        recommendations,
        generatedAt: new Date().toISOString(),
    };
    (0, logger_1.logInfo)("simulation_completed", {
        simulationId: output.simulationId,
        scenarioCount: scenarios.length,
        domain: params.domain,
    });
    return output;
}
// ---------------------------------------------------------------------------
// Domain-specific convenience wrappers
// ---------------------------------------------------------------------------
async function simulateRevenue(baseline, growthRates, periods) {
    return runSimulation({
        domain: "revenue",
        baselineValues: { revenue: baseline },
        variables: [{ name: "growthRate", min: growthRates[0] ?? 0.02, max: growthRates[growthRates.length - 1] ?? 0.15, distribution: "normal" }],
        periods,
        periodUnit: "month",
    });
}
async function simulateCosts(baseline, costDrivers, periods) {
    return runSimulation({
        domain: "cost",
        baselineValues: { totalCost: baseline, ...costDrivers },
        variables: [{ name: "inflationRate", min: 0.02, max: 0.08, distribution: "normal" }],
        periods,
        periodUnit: "month",
    });
}
async function simulateLabor(headcount, avgWage, periods) {
    return runSimulation({
        domain: "labor",
        baselineValues: { headcount, avgWage, laborCost: headcount * avgWage },
        variables: [{ name: "turnoverRate", min: 0.05, max: 0.30, distribution: "triangular", mostLikely: 0.15 }],
        periods,
        periodUnit: "month",
    });
}
async function simulateGrowth(baseRevenue, targetGrowthRate, periods) {
    return runSimulation({
        domain: "growth",
        baselineValues: { revenue: baseRevenue, growthRate: targetGrowthRate },
        variables: [{ name: "marketAdoption", min: 0.5, max: 1.5, distribution: "normal" }],
        periods,
        periodUnit: "quarter",
    });
}
// ---------------------------------------------------------------------------
// Internal helpers (stub implementations)
// ---------------------------------------------------------------------------
function buildScenarios(params) {
    const scenarioNames = ["Optimistic", "Base Case", "Pessimistic"];
    const multipliers = [1.2, 1.0, 0.8];
    return scenarioNames.map((name, idx) => {
        const mult = multipliers[idx] ?? 1.0;
        const results = Array.from({ length: params.periods }, (_, p) => ({
            period: p + 1,
            label: `${params.periodUnit.charAt(0).toUpperCase() + params.periodUnit.slice(1)} ${p + 1}`,
            values: Object.fromEntries(Object.entries(params.baselineValues).map(([k, v]) => [k, v * mult * (1 + p * 0.02)])),
        }));
        const summary = Object.fromEntries(Object.keys(params.baselineValues).map((k) => [
            k,
            results.reduce((sum, r) => sum + (r.values[k] ?? 0), 0),
        ]));
        return {
            scenarioId: `scen-${params.domain}-${name.toLowerCase().replace(" ", "-")}-${Date.now()}`,
            name,
            description: `${name} scenario for ${params.domain} simulation`,
            parameters: Object.fromEntries(params.variables.map((v) => [v.name, v.min + (v.max - v.min) * mult])),
            results,
            summary,
        };
    });
}
function aggregatePredictions(scenarios) {
    const base = scenarios.find((s) => s.name === "Base Case");
    if (!base)
        return {};
    return base.summary;
}
function generateRecommendations(domain, predictions) {
    const recs = [];
    recs.push(`Monitor ${domain} KPIs against base-case projections monthly.`);
    if (Object.values(predictions).some((v) => v > 0)) {
        recs.push("Base-case scenario indicates positive trajectory. Maintain current strategy.");
    }
    recs.push("Review pessimistic scenario mitigations to reduce downside risk exposure.");
    return recs;
}
//# sourceMappingURL=index.js.map