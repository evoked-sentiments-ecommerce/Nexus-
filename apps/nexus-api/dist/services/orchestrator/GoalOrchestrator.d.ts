import { Goal, GoalDecomposition } from "../../entities/Goal";
export interface GoalWorkstream {
    id: string;
    name: string;
    domain: string;
    engine: string;
    status: "planned" | "in_progress" | "completed";
    dependencies: string[];
    milestones: string[];
    deliverables: string[];
}
export interface GoalExecutionRoadmap {
    roadmapId: string;
    goalId: string;
    requiredDomains: string[];
    requiredEngines: string[];
    workstreams: GoalWorkstream[];
    workflowTriggers: string[];
    progress: {
        total: number;
        completed: number;
        percentComplete: number;
    };
    dependencyGraph: Array<{
        workstreamId: string;
        dependsOn: string[];
    }>;
    completionStatus: "not_started" | "active" | "completed";
    createdAt: string;
    updatedAt: string;
}
export declare class GoalOrchestrator {
    receiveGoal(goal: Goal): Promise<{
        goalId: string;
        acceptedAt: string;
    }>;
    determineRequiredDomains(goal: Goal): string[];
    determineRequiredEngines(requiredDomains: string[]): string[];
    buildExecutionRoadmap(goal: Goal, decomposition: GoalDecomposition, requiredDomains: string[], requiredEngines: string[]): GoalExecutionRoadmap;
    triggerGenerationWorkflows(requiredEngines: string[]): string[];
    trackProgress(workstreams: GoalWorkstream[]): GoalExecutionRoadmap["progress"];
    trackDependencies(workstreams: GoalWorkstream[]): Array<{
        workstreamId: string;
        dependsOn: string[];
    }>;
    monitorCompletion(workstreams: GoalWorkstream[]): GoalExecutionRoadmap["completionStatus"];
    orchestrate(goal: Goal, decomposition: GoalDecomposition): Promise<GoalExecutionRoadmap>;
}
//# sourceMappingURL=GoalOrchestrator.d.ts.map