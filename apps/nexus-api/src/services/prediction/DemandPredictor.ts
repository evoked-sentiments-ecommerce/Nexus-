import type { PredictorInput, PredictorOutput } from "./PredictionEngine";

export class DemandPredictor {
  predict(input: PredictorInput): PredictorOutput {
    const elasticity = input.inputData.drivers.elasticityPct ?? 45;
    const seasonalBoost = input.inputData.drivers.seasonalityPct ?? 0;
    const demandMultiplier = 1 + (input.inputData.projectedChangePct * (elasticity / 100) + seasonalBoost) / 100;
    const value = input.inputData.baselineValue * demandMultiplier;
    const confidence = Math.max(42, 86 - input.inputData.volatilityPct * 2);
    const spread = value * (input.inputData.volatilityPct / 100) * 0.75;

    return {
      metric: "Demand",
      value,
      lowerBound: Math.max(0, value - spread),
      upperBound: value + spread,
      confidence,
      rationale: "Demand forecast applies elasticity and seasonality to the requested change.",
    };
  }
}
