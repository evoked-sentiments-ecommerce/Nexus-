"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastAnalyzer = void 0;
class ForecastAnalyzer {
    selectPrimaryMetric(predictionType, predictionModel, metrics) {
        const modelMetricMap = {
            revenue_predictor: "Revenue",
            cost_predictor: "Cost",
            growth_predictor: "Growth",
            risk_predictor: "Risk Score",
            demand_predictor: "Demand",
        };
        const typeMetricMap = {
            Revenue: "Revenue",
            Profitability: "Revenue",
            "Cash Flow": "Revenue",
            "Customer Acquisition": "Growth",
            "Customer Retention": "Growth",
            "Marketing Performance": "Growth",
            "Hiring Demand": "Demand",
            "Operational Efficiency": "Cost",
            "Project Success Probability": "Risk Score",
            "Growth Potential": "Growth",
            "Risk Exposure": "Risk Score",
            "Food Cost": "Cost",
            "Labor Cost": "Cost",
            "Prime Cost": "Cost",
            "Inventory Demand": "Demand",
            "Vendor Demand": "Demand",
            "Menu Performance": "Revenue",
            "Guest Demand": "Demand",
            "Revenue Per Cover": "Revenue",
            "Training Impact": "Growth",
            "Waste Levels": "Cost",
        };
        const preferredMetric = typeMetricMap[predictionType] ?? modelMetricMap[predictionModel] ?? "Revenue";
        return metrics.find((metric) => metric.name === preferredMetric) ?? metrics[0];
    }
    calculateConfidence(metrics) {
        if (metrics.length === 0)
            return 0;
        const average = metrics.reduce((sum, metric) => sum + metric.confidence, 0) / metrics.length;
        return Number(average.toFixed(2));
    }
    buildRisks(predictionType, metrics, domain) {
        const riskScore = metrics.find((metric) => metric.name === "Risk Score")?.value ?? 50;
        const demandValue = metrics.find((metric) => metric.name === "Demand")?.value ?? 0;
        const risks = [
            {
                title: `${predictionType} forecast variance`,
                level: riskScore >= 70 ? "high" : riskScore >= 45 ? "medium" : "low",
                probabilityPct: Math.round(Math.min(95, Math.max(5, riskScore))),
                mitigation: "Review assumptions weekly and update the forecast when operating inputs shift.",
            },
            {
                title: domain === "chef_drew" ? "Operational execution drag" : "Execution drift",
                level: riskScore >= 65 ? "high" : "medium",
                probabilityPct: Math.round(Math.min(90, Math.max(10, riskScore * 0.85))),
                mitigation: domain === "chef_drew"
                    ? "Align staffing, prep, and vendor cadence to forecast checkpoints."
                    : "Tie execution owners to KPI checkpoints and contingency plans.",
            },
        ];
        if (demandValue < 0) {
            risks.push({
                title: "Demand contraction",
                level: "high",
                probabilityPct: 70,
                mitigation: "Trigger retention and recovery plays before scaling fixed costs.",
            });
        }
        return risks;
    }
    buildAssumptions(inputData, outputs) {
        const generated = outputs.slice(0, 3).map((output) => output.rationale);
        return Array.from(new Set([...inputData.assumptions, ...generated]));
    }
    buildRecommendations(predictionType, domain, metrics, risks) {
        const revenue = metrics.find((metric) => metric.name === "Revenue")?.value ?? 0;
        const cost = metrics.find((metric) => metric.name === "Cost")?.value ?? 0;
        const growth = metrics.find((metric) => metric.name === "Growth")?.value ?? 0;
        const recommendations = [
            domain === "chef_drew"
                ? `Use ${predictionType} forecast reviews to tune labor, prep, and vendor ordering.`
                : `Use ${predictionType} forecast reviews to tune execution pacing, budgets, and owners.`,
            revenue >= cost
                ? "Expected returns outpace projected costs; scale with control gates instead of all-at-once expansion."
                : "Projected costs are heavy relative to returns; tighten spend controls before committing more capital.",
            growth >= 0
                ? "Preserve quality and retention safeguards while executing the upside scenario."
                : "Rework pricing, demand generation, or operating levers before pursuing aggressive expansion.",
        ];
        if (risks.some((risk) => risk.level === "high")) {
            recommendations.push("Create downside triggers and contingency actions before execution begins.");
        }
        return recommendations;
    }
    estimateExpectedCosts(predictionType, metrics) {
        const costMetric = metrics.find((metric) => metric.name === "Cost")?.value;
        if (costMetric != null)
            return Number(costMetric.toFixed(2));
        return predictionType.includes("Cost") ? Number((metrics[0]?.value ?? 0).toFixed(2)) : 0;
    }
    estimateExpectedReturns(predictionType, metrics, baselineValue) {
        const revenueMetric = metrics.find((metric) => metric.name === "Revenue")?.value;
        if (revenueMetric != null)
            return Number((revenueMetric - baselineValue).toFixed(2));
        const demandMetric = metrics.find((metric) => metric.name === "Demand")?.value ?? 0;
        return Number((demandMetric - baselineValue * 0.6).toFixed(2));
    }
    estimateGrowthPotential(metrics) {
        return Number((metrics.find((metric) => metric.name === "Growth")?.value ?? 0).toFixed(2));
    }
    calculateForecastChange(value, baselineValue) {
        if (baselineValue === 0)
            return value === 0 ? 0 : 100;
        return Number((((value - baselineValue) / Math.abs(baselineValue)) * 100).toFixed(2));
    }
    buildExpectedOutcomes(predictionType, primaryMetric, growthPotential, expectedReturns) {
        return [
            `${predictionType} forecast centers on ${primaryMetric.name.toLowerCase()} reaching ${primaryMetric.value.toFixed(2)}.`,
            `Growth potential is projected at ${growthPotential.toFixed(2)}%.`,
            `Expected returns are projected at ${expectedReturns.toFixed(2)} over the forecast period.`,
        ];
    }
    calculateAccuracyScore(predicted, actual) {
        const denominator = Math.max(Math.abs(actual), 1);
        const pctError = Math.abs(predicted - actual) / denominator;
        return Number(Math.max(0, Math.min(100, 100 - pctError * 100)).toFixed(2));
    }
}
exports.ForecastAnalyzer = ForecastAnalyzer;
//# sourceMappingURL=ForecastAnalyzer.js.map