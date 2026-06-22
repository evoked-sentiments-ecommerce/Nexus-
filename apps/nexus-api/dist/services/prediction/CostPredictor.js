"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostPredictor = void 0;
class CostPredictor {
    predict(input) {
        const inflation = input.inputData.drivers.inflationPct ?? 2;
        const efficiency = input.inputData.drivers.efficiencyGainPct ?? 0;
        const efficiencyFactor = 1 + (inflation - efficiency - input.inputData.projectedChangePct * 0.25) / 100;
        const driftFactor = 1 + input.forecastPeriods * 0.009;
        const value = input.inputData.baselineValue * efficiencyFactor * driftFactor;
        const confidence = Math.max(40, 88 - input.inputData.volatilityPct * 2.5);
        const spread = value * (input.inputData.volatilityPct / 100);
        return {
            metric: "Cost",
            value,
            lowerBound: Math.max(0, value - spread),
            upperBound: value + spread,
            confidence,
            rationale: "Cost projection accounts for inflation, efficiency, and drift over the forecast horizon.",
        };
    }
}
exports.CostPredictor = CostPredictor;
//# sourceMappingURL=CostPredictor.js.map