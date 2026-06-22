import { PredictionDomain, PredictionInputData, PredictionMetric, PredictionRisk, PredictionType } from "../../entities/Prediction";
import { PredictorOutput } from "./PredictionEngine";
export declare class ForecastAnalyzer {
    selectPrimaryMetric(predictionType: PredictionType, predictionModel: string, metrics: PredictionMetric[]): PredictionMetric;
    calculateConfidence(metrics: PredictionMetric[]): number;
    buildRisks(predictionType: PredictionType, metrics: PredictionMetric[], domain: PredictionDomain): PredictionRisk[];
    buildAssumptions(inputData: PredictionInputData, outputs: PredictorOutput[]): string[];
    buildRecommendations(predictionType: PredictionType, domain: PredictionDomain, metrics: PredictionMetric[], risks: PredictionRisk[]): string[];
    estimateExpectedCosts(predictionType: PredictionType, metrics: PredictionMetric[]): number;
    estimateExpectedReturns(predictionType: PredictionType, metrics: PredictionMetric[], baselineValue: number): number;
    estimateGrowthPotential(metrics: PredictionMetric[]): number;
    calculateForecastChange(value: number, baselineValue: number): number;
    buildExpectedOutcomes(predictionType: PredictionType, primaryMetric: PredictionMetric, growthPotential: number, expectedReturns: number): string[];
    calculateAccuracyScore(predicted: number, actual: number): number;
}
//# sourceMappingURL=ForecastAnalyzer.d.ts.map