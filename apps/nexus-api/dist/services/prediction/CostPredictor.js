"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostPredictor = void 0;
class CostPredictor {
    predict(input) {
        const efficiencyFactor = 1 - input.projectedChangePct / 200;
        const driftFactor = 1 + input.horizonPeriods * 0.008;
        const value = input.baselineValue * efficiencyFactor * driftFactor;
        const confidence = Math.max(40, 88 - input.volatilityPct * 2.5);
        const spread = value * (input.volatilityPct / 100);
        return {
            metric: "Cost",
            value,
            lowerBound: Math.max(0, value - spread),
            upperBound: value + spread,
            confidence,
            rationale: "Cost projection accounts for efficiency effects and inflationary drift over time.",
        };
    }
}
exports.CostPredictor = CostPredictor;
//# sourceMappingURL=CostPredictor.js.map