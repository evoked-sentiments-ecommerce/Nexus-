export interface Goal {
    id: string;
    title: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
    context?: Record<string, unknown>;
}
export interface GeneratedObjective {
    id: string;
    goalId: string;
    title: string;
    description: string;
    successCriteria: string[];
    estimatedEffort: "small" | "medium" | "large";
}
export interface PlannedTask {
    id: string;
    objectiveId: string;
    title: string;
    description: string;
    order: number;
    dependsOn: string[];
    assignee?: string;
    dueDate?: string;
}
export interface Plan {
    planId: string;
    goalId: string;
    objectives: GeneratedObjective[];
    tasks: PlannedTask[];
    createdAt: string;
}
/**
 * Decompose a high-level goal into a structured set of sub-goals.
 *
 * The current implementation returns a deterministic stub.  Replace the body
 * with an LLM call (e.g. OpenAI function-calling) or a rule-based engine to
 * produce real decompositions.
 */
export declare function decomposeGoal(goal: Goal): Promise<Goal[]>;
/**
 * Generate SMART objectives for a goal.
 *
 * Replace the stub body with an LLM call or rule engine for real objective
 * generation.
 */
export declare function generateObjectives(goal: Goal): Promise<GeneratedObjective[]>;
/**
 * Break a list of objectives down into an ordered, dependency-aware task list.
 *
 * Replace the stub body with an LLM call or rule engine for real task
 * planning.
 */
export declare function planTasks(objectives: GeneratedObjective[]): Promise<PlannedTask[]>;
/**
 * Run the complete planning pipeline for a goal:
 *   goal → objectives → tasks → Plan
 */
export declare function buildPlan(goal: Goal): Promise<Plan>;
//# sourceMappingURL=index.d.ts.map