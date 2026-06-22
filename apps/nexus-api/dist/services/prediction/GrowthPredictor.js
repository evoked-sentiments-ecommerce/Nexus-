"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowthPredictor = void 0;
class GrowthPredictor {
    predict(input) {
        const growthRate = input.projectedChangePct + input.horizonPeriods * 0.6;
        const normalizedGrowth = Math.max(-100, growthRate);
        const value = normalizedGrowth;
        const confidence = Math.max(35, 85 - input.volatilityPct * 1.5);
        const spread = Math.max(2, input.volatilityPct * 0.7);
        return {
            metric: "Growth",
            value,
            lowerBound: value - spread,
            upperBound: value + spread,
            confidence,
            rationale: "Growth estimate reflects planned change plus compound horizon effects.",
        };
    }
}
exports.GrowthPredictor = GrowthPredictor;
//# sourceMappingURL=GrowthPredictor.js.map