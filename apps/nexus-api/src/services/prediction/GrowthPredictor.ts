import type { PredictorInput, PredictorOutput } from "./PredictionEngine";

export class GrowthPredictor {
  predict(input: PredictorInput): PredictorOutput {
    const acquisition = input.inputData.drivers.acquisitionLiftPct ?? 0;
    const retention = input.inputData.drivers.retentionLiftPct ?? 0;
    const growthRate = input.inputData.projectedChangePct + input.forecastPeriods * 0.6 + acquisition * 0.4 + retention * 0.6;
    const value = Math.max(-100, growthRate);
    const confidence = Math.max(35, 85 - input.inputData.volatilityPct * 1.5);
    const spread = Math.max(2, input.inputData.volatilityPct * 0.7);

    return {
      metric: "Growth",
      value,
      lowerBound: value - spread,
      upperBound: value + spread,
      confidence,
      rationale: "Growth estimate reflects planned change plus acquisition and retention drivers.",
    };
  }
}
