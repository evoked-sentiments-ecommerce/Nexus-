"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandPredictor = void 0;
class DemandPredictor {
    predict(input) {
        const sensitivity = 0.45;
        const demandMultiplier = 1 + (input.projectedChangePct * sensitivity) / 100;
        const value = input.baselineValue * demandMultiplier;
        const confidence = Math.max(42, 86 - input.volatilityPct * 2);
        const spread = value * (input.volatilityPct / 100) * 0.75;
        return {
            metric: "Demand",
            value,
            lowerBound: Math.max(0, value - spread),
            upperBound: value + spread,
            confidence,
            rationale: "Demand forecast applies elasticity-sensitive response to the proposed change.",
        };
    }
}
exports.DemandPredictor = DemandPredictor;
//# sourceMappingURL=DemandPredictor.js.map