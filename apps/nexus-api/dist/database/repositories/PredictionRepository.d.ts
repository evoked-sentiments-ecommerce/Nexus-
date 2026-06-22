import { QueryResult } from "../connection";
import { Prediction, PredictionType } from "../../entities/Prediction";
type QueryFn = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<QueryResult<T>>;
export declare class PredictionRepository {
    private readonly queryFn;
    constructor(queryFn?: QueryFn);
    list(filter?: {
        goalId?: string;
        projectId?: string;
        predictionType?: PredictionType;
    }): Promise<Prediction[]>;
    getById(id: string): Promise<Prediction | null>;
    create(prediction: Prediction): Promise<Prediction | null>;
    updateActualOutcome(id: string, actualOutcome: Record<string, unknown>, accuracyScore: number): Promise<Prediction | null>;
}
export {};
//# sourceMappingURL=PredictionRepository.d.ts.map