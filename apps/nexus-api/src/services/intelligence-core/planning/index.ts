// ---------------------------------------------------------------------------
// Intelligence Core — Planning
// Goal decomposition, objective generation, task planning, and dependency-
// aware execution scheduling.
// ---------------------------------------------------------------------------

import { logInfo } from "../../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Goal decomposition (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function decomposeGoal(goal: Goal): Promise<Goal[]> {
  logInfo("planning_goal_decomposed", { goalId: goal.goalId });
  return [
    { goalId: `${goal.goalId}-research`, title: `Research: ${goal.title}`, description: `Assess feasibility and gather knowledge for: ${goal.description}`, priority: goal.priority, successCriteria: ["Findings documented"] },
    { goalId: `${goal.goalId}-design`, title: `Design: ${goal.title}`, description: `Architect the solution for: ${goal.description}`, priority: goal.priority, successCriteria: ["Architecture approved"] },
    { goalId: `${goal.goalId}-execute`, title: `Execute: ${goal.title}`, description: `Implement and deliver: ${goal.description}`, priority: goal.priority, successCriteria: ["Deliverables produced and verified"] },
  ];
}

// ---------------------------------------------------------------------------
// Objective generation (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function generateObjectives(goal: Goal): Promise<Objective[]> {
  logInfo("planning_objectives_generated", { goalId: goal.goalId });
  return [
    {
      objectiveId: `obj-${goal.goalId}-1`,
      goalId: goal.goalId,
      title: `Define success criteria for "${goal.title}"`,
      description: "Establish measurable outcomes confirming goal completion.",
      successCriteria: ["Criteria documented", "Stakeholders aligned"],
      effort: "small",
      priority: goal.priority,
    },
    {
      objectiveId: `obj-${goal.goalId}-2`,
      goalId: goal.goalId,
      title: `Deliver core artefacts for "${goal.title}"`,
      description: "Produce all primary deliverables required to satisfy the goal.",
      successCriteria: ["All artefacts delivered", "Quality verified"],
      effort: "large",
      priority: goal.priority,
    },
    {
      objectiveId: `obj-${goal.goalId}-3`,
      goalId: goal.goalId,
      title: `Validate and close "${goal.title}"`,
      description: "Confirm success criteria met and capture learnings.",
      successCriteria: ["Sign-off obtained", "Learnings recorded"],
      effort: "small",
      priority: "low",
    },
  ];
}

// ---------------------------------------------------------------------------
// Task planning (stub — replace with LLM)
// ---------------------------------------------------------------------------

export async function planTasks(objectives: Objective[]): Promise<Task[]> {
  const tasks: Task[] = [];
  for (const obj of objectives) {
    logInfo("planning_tasks_planned", { objectiveId: obj.objectiveId });
    tasks.push(
      { taskId: `task-${obj.objectiveId}-1`, objectiveId: obj.objectiveId, title: `Prepare for: ${obj.title}`, description: "Confirm prerequisites.", order: 1, dependsOn: [], status: "pending" },
      { taskId: `task-${obj.objectiveId}-2`, objectiveId: obj.objectiveId, title: `Execute: ${obj.title}`, description: "Complete core work.", order: 2, dependsOn: [`task-${obj.objectiveId}-1`], status: "pending" },
      { taskId: `task-${obj.objectiveId}-3`, objectiveId: obj.objectiveId, title: `Verify: ${obj.title}`, description: "Confirm success criteria.", order: 3, dependsOn: [`task-${obj.objectiveId}-2`], status: "pending" }
    );
  }
  return tasks;
}

// ---------------------------------------------------------------------------
// Full planning pipeline
// ---------------------------------------------------------------------------

export async function buildExecutionPlan(goal: Goal): Promise<ExecutionPlan> {
  const objectives = await generateObjectives(goal);
  const tasks = await planTasks(objectives);
  const criticalPath = tasks.filter((t) => t.dependsOn.length === 0).map((t) => t.taskId);

  const plan: ExecutionPlan = {
    planId: `plan-${goal.goalId}-${Date.now()}`,
    goalId: goal.goalId,
    objectives,
    tasks,
    estimatedDuration: "variable",
    criticalPath,
    createdAt: new Date().toISOString(),
  };

  logInfo("planning_plan_built", {
    planId: plan.planId,
    goalId: goal.goalId,
    objectiveCount: objectives.length,
    taskCount: tasks.length,
  });

  return plan;
}
