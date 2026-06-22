import { Prediction, PredictionScope, PredictionTarget } from "../../entities/Prediction";
import { ForecastRepository } from "./ForecastRepository";
import { RevenuePredictor } from "./RevenuePredictor";
import { CostPredictor } from "./CostPredictor";
import { GrowthPredictor } from "./GrowthPredictor";
import { DemandPredictor } from "./DemandPredictor";
import { RiskPredictor } from "./RiskPredictor";
export interface PredictorInput {
    baselineValue: number;
    projectedChangePct: number;
    horizonPeriods: number;
    volatilityPct: number;
}
export interface PredictorOutput {
    metric: string;
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
    rationale: string;
}
export interface CreatePredictionInput {
    title: string;
    scope: PredictionScope;
    target: PredictionTarget;
    requestedBy: string | null;
    baselineValue: number;
    projectedChangePct: number;
    horizonPeriods: number;
    periodUnit: "day" | "week" | "month" | "quarter" | "year";
    volatilityPct: number;
    context: Record<string, unknown>;
}
export declare class PredictionService {
    private readonly repository;
    private readonly revenuePredictor;
    private readonly costPredictor;
    private readonly growthPredictor;
    private readonly demandPredictor;
    private readonly riskPredictor;
    constructor(repository?: ForecastRepository, revenuePredictor?: RevenuePredictor, costPredictor?: CostPredictor, growthPredictor?: GrowthPredictor, demandPredictor?: DemandPredictor, riskPredictor?: RiskPredictor);
    createPrediction(input: CreatePredictionInput): Promise<Prediction>;
    listPredictions(filters?: {
        scope?: PredictionScope;
        target?: PredictionTarget;
    }): Promise<Prediction[]>;
    getPrediction(id: string): Promise<Prediction | null>;
    compareForecastToActual(id: string, actualOutcome: number): Promise<Prediction | null>;
    getAccuracySummary(target?: string): Promise<Record<string, number>>;
    private buildRisks;
    private buildRecommendations;
    private integratePredictionSignals;
}
//# sourceMappingURL=PredictionService.d.ts.map