export type Priority = "critical" | "high" | "medium" | "low";
export type EffortSize = "trivial" | "small" | "medium" | "large" | "x-large";
export interface Goal {
    goalId: string;
    title: string;
    description: string;
    priority: Priority;
    successCriteria: string[];
    context?: Record<string, unknown>;
}
export interface Objective {
    objectiveId: string;
    goalId: string;
    title: string;
    description: string;
    successCriteria: string[];
    effort: EffortSize;
    priority: Priority;
}
export interface Task {
    taskId: string;
    objectiveId: string;
    title: string;
    description: string;
    order: number;
    dependsOn: string[];
    assigneeType?: string;
    dueDate?: string;
    status: "pending" | "in_progress" | "completed" | "blocked";
}
export interface ExecutionPlan {
    planId: string;
    goalId: string;
    objectives: Objective[];
    tasks: Task[];
    estimatedDuration: string;
    criticalPath: string[];
    createdAt: string;
}
export declare function decomposeGoal(goal: Goal): Promise<Goal[]>;
export declare function generateObjectives(goal: Goal): Promise<Objective[]>;
export declare function planTasks(objectives: Objective[]): Promise<Task[]>;
export declare function buildExecutionPlan(goal: Goal): Promise<ExecutionPlan>;
//# sourceMappingURL=index.d.ts.map