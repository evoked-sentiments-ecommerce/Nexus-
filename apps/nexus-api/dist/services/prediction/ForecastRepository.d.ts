import { Prediction } from "../../entities/Prediction";
export interface ForecastAccuracyRecord {
    predictionId: string;
    target: string;
    forecastValue: number;
    actualValue: number;
    accuracyScore: number;
    comparedAt: string;
}
export declare class ForecastRepository {
    private readonly predictions;
    private readonly accuracy;
    create(prediction: Prediction): Promise<Prediction>;
    list(filters?: {
        scope?: Prediction["scope"];
        target?: Prediction["target"];
    }): Promise<Prediction[]>;
    getById(id: string): Promise<Prediction | null>;
    compareForecastToActual(predictionId: string, actualValue: number): Promise<Prediction | null>;
    getAccuracySummary(target?: string): Promise<Record<string, number>>;
}
//# sourceMappingURL=ForecastRepository.d.ts.map