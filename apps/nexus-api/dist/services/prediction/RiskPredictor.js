"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskPredictor = void 0;
class RiskPredictor {
    predict(input) {
        const leverageRisk = Math.abs(input.inputData.drivers.leveragePct ?? 0) * 0.5;
        const changeRisk = Math.abs(input.inputData.projectedChangePct) * 0.7;
        const horizonRisk = input.forecastPeriods * 0.9;
        const volatilityRisk = input.inputData.volatilityPct * 1.4;
        const value = Math.min(100, Math.max(0, 15 + leverageRisk + changeRisk + horizonRisk + volatilityRisk));
        const confidence = Math.max(50, 95 - input.inputData.volatilityPct * 1.2);
        const spread = Math.max(3, input.inputData.volatilityPct * 0.5);
        return {
            metric: "Risk Score",
            value,
            lowerBound: Math.max(0, value - spread),
            upperBound: Math.min(100, value + spread),
            confidence,
            rationale: "Risk score combines leverage, change magnitude, forecast horizon, and volatility.",
        };
    }
}
exports.RiskPredictor = RiskPredictor;
//# sourceMappingURL=RiskPredictor.js.map