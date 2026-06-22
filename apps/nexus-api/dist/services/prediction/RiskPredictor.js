"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskPredictor = void 0;
class RiskPredictor {
    predict(input) {
        const changeRisk = Math.abs(input.projectedChangePct) * 0.7;
        const horizonRisk = input.horizonPeriods * 0.9;
        const volatilityRisk = input.volatilityPct * 1.4;
        const value = Math.min(100, Math.max(0, 15 + changeRisk + horizonRisk + volatilityRisk));
        const confidence = Math.max(50, 95 - input.volatilityPct * 1.2);
        const spread = Math.max(3, input.volatilityPct * 0.5);
        return {
            metric: "Risk Score",
            value,
            lowerBound: Math.max(0, value - spread),
            upperBound: Math.min(100, value + spread),
            confidence,
            rationale: "Risk score combines change magnitude, forecasting horizon, and input volatility.",
        };
    }
}
exports.RiskPredictor = RiskPredictor;
//# sourceMappingURL=RiskPredictor.js.map