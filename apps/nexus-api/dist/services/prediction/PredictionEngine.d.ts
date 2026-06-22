import { PredictedOutcome, PredictionInputData, PredictionModel, PredictionType } from "../../entities/Prediction";
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
export declare class PredictionEngine {
    private readonly revenuePredictor;
    private readonly costPredictor;
    private readonly growthPredictor;
    private readonly riskPredictor;
    private readonly demandPredictor;
    private readonly analyzer;
    constructor(revenuePredictor?: RevenuePredictor, costPredictor?: CostPredictor, growthPredictor?: GrowthPredictor, riskPredictor?: RiskPredictor, demandPredictor?: DemandPredictor, analyzer?: ForecastAnalyzer);
    run(input: PredictorInput, predictionModel: PredictionModel): PredictedOutcome;
}
//# sourceMappingURL=PredictionEngine.d.ts.map