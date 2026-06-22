import type { PredictorInput, PredictorOutput } from "./PredictionService";

export class RevenuePredictor {
  predict(input: PredictorInput): PredictorOutput {
    const growthFactor = 1 + input.projectedChangePct / 100;
    const horizonFactor = 1 + input.horizonPeriods * 0.01;
    const value = input.baselineValue * growthFactor * horizonFactor;
    const confidence = Math.max(45, 92 - input.volatilityPct * 2);
    const spread = value * (input.volatilityPct / 100) * 0.8;

    return {
      metric: "Revenue",
      value,
      lowerBound: Math.max(0, value - spread),
      upperBound: value + spread,
      confidence,
      rationale: "Revenue projection combines requested change, horizon trend, and volatility.",
    };
  }
}
