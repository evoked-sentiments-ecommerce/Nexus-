"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizationEngine = void 0;
class OptimizationEngine {
    score(impacts) {
        const revenue = impacts.find((impact) => impact.name === "Revenue Impact")?.value ?? 0;
        const profit = impacts.find((impact) => impact.name === "Profit Impact")?.value ?? 0;
        const foodCost = impacts.find((impact) => impact.name === "Food Cost Impact")?.value ?? 0;
        const labor = impacts.find((impact) => impact.name === "Labor Impact")?.value ?? 0;
        const guestRetention = impacts.find((impact) => impact.name === "Guest Retention Impact")?.value ?? 0;
        const rawScore = 70 + revenue * 0.05 + profit * 0.08 + guestRetention * 0.04 - foodCost * 0.06 - labor * 0.05;
        return Math.max(0, Math.min(100, Number(rawScore.toFixed(2))));
    }
    recommendations(impacts, recommendationScore) {
        const recommendations = [];
        const revenue = impacts.find((impact) => impact.name === "Revenue Impact")?.value ?? 0;
        const guestRetention = impacts.find((impact) => impact.name === "Guest Retention Impact")?.value ?? 0;
        const foodCost = impacts.find((impact) => impact.name === "Food Cost Impact")?.value ?? 0;
        if (revenue > 0) {
            recommendations.push("Projected revenue increases; proceed with phased rollout and weekly KPI reviews.");
        }
        else {
            recommendations.push("Revenue pressure detected; limit rollout to pilot cohorts before full deployment.");
        }
        if (guestRetention < 0) {
            recommendations.push("Guest retention downside exists; pair changes with experience and loyalty safeguards.");
        }
        if (foodCost > 0) {
            recommendations.push("Food cost pressure is rising; negotiate purchasing terms and optimize menu mix.");
        }
        if (recommendationScore >= 75) {
            recommendations.push("Recommendation score is strong; implementation is favorable with controlled monitoring.");
        }
        else {
            recommendations.push("Recommendation score is moderate/low; run additional scenarios before operational execution.");
        }
        return recommendations;
    }
}
exports.OptimizationEngine = OptimizationEngine;
//# sourceMappingURL=OptimizationEngine.js.map