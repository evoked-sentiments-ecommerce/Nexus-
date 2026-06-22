// ---------------------------------------------------------------------------
// Planner Service — goal decomposition, objective generation, and task
// planning for the Nexus Intelligence Core.
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Goal decomposition
// ---------------------------------------------------------------------------

/**
 * Decompose a high-level goal into a structured set of sub-goals.
 *
 * The current implementation returns a deterministic stub.  Replace the body
 * with an LLM call (e.g. OpenAI function-calling) or a rule-based engine to
 * produce real decompositions.
 */
export async function decomposeGoal(goal: Goal): Promise<Goal[]> {
  logInfo("planner_goal_decomposed", { goalId: goal.id, title: goal.title });

  // Stub — replace with LLM-driven decomposition.
  return [
    {
      id: `${goal.id}-sub-1`,
      title: `Research phase: ${goal.title}`,
      description: `Gather information and assess feasibility for: ${goal.description}`,
      priority: goal.priority,
    },
    {
      id: `${goal.id}-sub-2`,
      title: `Execution phase: ${goal.title}`,
      description: `Implement and deliver: ${goal.description}`,
      priority: goal.priority,
    },
    {
      id: `${goal.id}-sub-3`,
      title: `Review phase: ${goal.title}`,
      description: `Validate outcomes and capture learnings for: ${goal.description}`,
      priority: "low",
    },
  ];
}

// ---------------------------------------------------------------------------
// Objective generation
// ---------------------------------------------------------------------------

/**
 * Generate SMART objectives for a goal.
 *
 * Replace the stub body with an LLM call or rule engine for real objective
 * generation.
 */
export async function generateObjectives(goal: Goal): Promise<GeneratedObjective[]> {
  logInfo("planner_objectives_generated", { goalId: goal.id });

  // Stub — replace with LLM-driven objective generation.
  return [
    {
      id: `obj-${goal.id}-1`,
      goalId: goal.id,
      title: `Define success criteria for "${goal.title}"`,
      description: "Establish measurable outcomes that confirm goal completion.",
      successCriteria: ["Criteria documented", "Stakeholders aligned"],
      estimatedEffort: "small",
    },
    {
      id: `obj-${goal.id}-2`,
      goalId: goal.id,
      title: `Execute core deliverables for "${goal.title}"`,
      description: "Produce the primary artefacts required to satisfy the goal.",
      successCriteria: ["Deliverables produced", "Quality verified"],
      estimatedEffort: "large",
    },
  ];
}

// ---------------------------------------------------------------------------
// Task planning
// ---------------------------------------------------------------------------

/**
 * Break a list of objectives down into an ordered, dependency-aware task list.
 *
 * Replace the stub body with an LLM call or rule engine for real task
 * planning.
 */
export async function planTasks(objectives: GeneratedObjective[]): Promise<PlannedTask[]> {
  const tasks: PlannedTask[] = [];

  for (const obj of objectives) {
    logInfo("planner_tasks_planned", { objectiveId: obj.id });

    // Stub — replace with LLM-driven task breakdown.
    tasks.push(
      {
        id: `task-${obj.id}-1`,
        objectiveId: obj.id,
        title: `Prepare for: ${obj.title}`,
        description: "Gather prerequisites and confirm scope.",
        order: 1,
        dependsOn: [],
      },
      {
        id: `task-${obj.id}-2`,
        objectiveId: obj.id,
        title: `Execute: ${obj.title}`,
        description: "Complete the core work for this objective.",
        order: 2,
        dependsOn: [`task-${obj.id}-1`],
      },
      {
        id: `task-${obj.id}-3`,
        objectiveId: obj.id,
        title: `Verify: ${obj.title}`,
        description: "Confirm success criteria are met.",
        order: 3,
        dependsOn: [`task-${obj.id}-2`],
      }
    );
  }

  return tasks;
}

// ---------------------------------------------------------------------------
// Full planning pipeline
// ---------------------------------------------------------------------------

/**
 * Run the complete planning pipeline for a goal:
 *   goal → objectives → tasks → Plan
 */
export async function buildPlan(goal: Goal): Promise<Plan> {
  const objectives = await generateObjectives(goal);
  const tasks = await planTasks(objectives);

  const plan: Plan = {
    planId: `plan-${goal.id}-${Date.now()}`,
    goalId: goal.id,
    objectives,
    tasks,
    createdAt: new Date().toISOString(),
  };

  logInfo("planner_plan_built", { planId: plan.planId, goalId: goal.id, objectiveCount: objectives.length, taskCount: tasks.length });

  return plan;
}
