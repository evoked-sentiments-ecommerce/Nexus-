import { Goal, GoalDecomposition } from "../entities/Goal";
import { GoalExecutionRoadmap, GoalOrchestrator } from "./orchestrator/GoalOrchestrator";
export declare class GoalService {
    private readonly orchestrator;
    constructor(orchestrator?: GoalOrchestrator);
    decomposeGoal(goal: Goal): Promise<GoalDecomposition>;
    orchestrateGoal(goal: Goal, decomposition: GoalDecomposition): Promise<GoalExecutionRoadmap>;
    captureGoalCreation(goal: Goal): Promise<void>;
    captureGoalUpdate(goal: Goal): Promise<void>;
    captureGoalOutcome(goal: Goal): Promise<{
        recommendations: string[];
    }>;
}
//# sourceMappingURL=goalService.d.ts.map