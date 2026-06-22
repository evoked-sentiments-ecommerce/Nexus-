import { QueryResult } from "../connection";
import { Goal } from "../../entities/Goal";
type QueryFn = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<QueryResult<T>>;
export declare class GoalRepository {
    private readonly queryFn;
    constructor(queryFn?: QueryFn);
    list(filter?: {
        goalType?: string;
        status?: string;
    }): Promise<Goal[]>;
    getById(id: string): Promise<Goal | null>;
    create(goal: Goal): Promise<Goal | null>;
    update(id: string, input: Partial<Pick<Goal, "title" | "description" | "goalType" | "industry" | "priority" | "status" | "targetDate" | "successCriteria" | "estimatedImpact" | "estimatedValue">>): Promise<Goal | null>;
    delete(id: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=GoalRepository.d.ts.map