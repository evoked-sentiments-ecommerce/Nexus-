import { Prediction, PredictionInputData, PredictionModel, PredictionType } from "../../entities/Prediction";
import { PredictionRepository } from "../../database/repositories/PredictionRepository";
import { ForecastAnalyzer } from "./ForecastAnalyzer";
import { PredictionEngine } from "./PredictionEngine";
export interface CreatePredictionInput {
    goalId: string | null;
    projectId: string | null;
    predictionType: PredictionType;
    predictionModel: PredictionModel;
    forecastPeriod: Prediction["forecastPeriod"];
    inputData: PredictionInputData;
    requestedBy: string | null;
}
export declare class PredictionService {
    private readonly repository;
    private readonly predictionEngine;
    private readonly analyzer;
    private readonly memoryPredictions;
    constructor(repository?: PredictionRepository, predictionEngine?: PredictionEngine, analyzer?: ForecastAnalyzer);
    createPrediction(input: CreatePredictionInput): Promise<Prediction>;
    listPredictions(filters?: {
        goalId?: string;
        projectId?: string;
        predictionType?: PredictionType;
    }): Promise<Prediction[]>;
    getPrediction(id: string): Promise<Prediction | null>;
    compareForecastToActual(id: string, actualOutcome: Record<string, unknown>, requestedBy: string | null): Promise<Prediction | null>;
    getAccuracySummary(predictionType?: string): Promise<Record<string, number>>;
    summarizeAccuracy(predictionType?: string): Promise<Record<string, number>>;
    private integratePredictionSignals;
    private integrateLearning;
}
//# sourceMappingURL=PredictionService.d.ts.map