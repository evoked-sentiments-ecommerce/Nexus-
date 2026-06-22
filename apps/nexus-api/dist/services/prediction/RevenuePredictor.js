"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenuePredictor = void 0;
class RevenuePredictor {
    predict(input) {
        const growthFactor = 1 + input.inputData.projectedChangePct / 100;
        const horizonFactor = 1 + input.forecastPeriods * 0.012;
        const driverFactor = 1 + ((input.inputData.drivers.pricingPower ?? 0) + (input.inputData.drivers.conversionLift ?? 0)) / 200;
        const value = input.inputData.baselineValue * growthFactor * horizonFactor * driverFactor;
        const confidence = Math.max(45, 92 - input.inputData.volatilityPct * 2);
        const spread = value * (input.inputData.volatilityPct / 100) * 0.8;
        return {
            metric: "Revenue",
            value,
            lowerBound: Math.max(0, value - spread),
            upperBound: value + spread,
            confidence,
            rationale: "Revenue projection combines planned change, time horizon, and commercial drivers.",
        };
    }
}
exports.RevenuePredictor = RevenuePredictor;
//# sourceMappingURL=RevenuePredictor.js.map