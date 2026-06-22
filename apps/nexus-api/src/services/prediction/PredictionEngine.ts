import {
  PredictedOutcome,
  PredictionInputData,
  PredictionMetric,
  PredictionModel,
  PredictionRisk,
  PredictionType,
} from "../../entities/Prediction";
import { CostPredictor } from "./CostPredictor";
import { DemandPredictor } from "./DemandPredictor";
import { ForecastAnalyzer } from "./ForecastAnalyzer";
import { GrowthPredictor } from "./GrowthPredictor";
import { RevenuePredictor } from "./RevenuePredictor";
import { RiskPredictor } from "./RiskPredictor";

export interface PredictorInput {
  predictionType: PredictionType;
  forecastPeriods: number;
  inputData: PredictionInputData;
}

export interface PredictorOutput {
  metric: string;
  value: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  rationale: string;
}

export class PredictionEngine {
  constructor(
    private readonly revenuePredictor = new RevenuePredictor(),
    private readonly costPredictor = new CostPredictor(),
    private readonly growthPredictor = new GrowthPredictor(),
    private readonly riskPredictor = new RiskPredictor(),
    private readonly demandPredictor = new DemandPredictor(),
    private readonly analyzer = new ForecastAnalyzer()
  ) {}

  run(input: PredictorInput, predictionModel: PredictionModel): PredictedOutcome {
    const predictorOutputs = [
      this.revenuePredictor.predict(input),
      this.costPredictor.predict(input),
      this.growthPredictor.predict(input),
      this.riskPredictor.predict(input),
      this.demandPredictor.predict(input),
    ];

    const metrics: PredictionMetric[] = predictorOutputs.map((output) => ({
      name: output.metric,
      value: Number(output.value.toFixed(2)),
      lowerBound: Number(output.lowerBound.toFixed(2)),
      upperBound: Number(output.upperBound.toFixed(2)),
      confidence: Number(output.confidence.toFixed(2)),
    }));

    const risks = this.analyzer.buildRisks(input.predictionType, metrics, input.inputData.domain);
    const assumptions = this.analyzer.buildAssumptions(input.inputData, predictorOutputs);
    const recommendations = this.analyzer.buildRecommendations(input.predictionType, input.inputData.domain, metrics, risks);
    const primary = this.analyzer.selectPrimaryMetric(input.predictionType, predictionModel, metrics);
    const confidenceScore = this.analyzer.calculateConfidence(metrics);
    const expectedCosts = this.analyzer.estimateExpectedCosts(input.predictionType, metrics);
    const expectedReturns = this.analyzer.estimateExpectedReturns(input.predictionType, metrics, input.inputData.baselineValue);
    const growthPotential = this.analyzer.estimateGrowthPotential(metrics);

    return {
      primaryMetric: primary.name,
      forecastValue: primary.value,
      forecastChangePct: this.analyzer.calculateForecastChange(primary.value, input.inputData.baselineValue),
      lowerBound: primary.lowerBound,
      upperBound: primary.upperBound,
      confidenceScore,
      metrics,
      risks,
      assumptions,
      recommendations,
      expectedCosts,
      expectedReturns,
      expectedOutcomes: this.analyzer.buildExpectedOutcomes(input.predictionType, primary, growthPotential, expectedReturns),
      growthPotential,
    };
  }
}
