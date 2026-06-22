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

  try {
    const { structuredOutput }: {
      structuredOutput: <T>(
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        schema: string,
        options?: Record<string, unknown>
      ) => Promise<T>;
    } = require("../llm");
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const schema = `{"subGoals": [{"id": "string", "title": "string", "description": "string", "priority": "string"}]}`;
      const result = await structuredOutput<{ subGoals: Goal[] }>(
        [{ role: "user", content: `Decompose this goal into 3-7 concrete sub-goals: "${goal.title}"
Description: ${goal.description}` }],
        schema
      );
      if (result.subGoals && result.subGoals.length > 0) {
        return result.subGoals.map((sg: Goal, i: number) => ({
          id: `${goal.id}-sub-${i + 1}`,
          title: sg.title,
          description: sg.description,
          priority: goal.priority,
        }));
      }
    }
  } catch {
    // fall through to stub
  }

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

  try {
    const { structuredOutput }: {
      structuredOutput: <T>(
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        schema: string,
        options?: Record<string, unknown>
      ) => Promise<T>;
    } = require("../llm");
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const schema = `{"objectives": [{"title": "string", "description": "string", "successCriteria": ["string"], "estimatedEffort": "small|medium|large"}]}`;
      const result = await structuredOutput<{ objectives: Array<Pick<GeneratedObjective, "title" | "description" | "successCriteria" | "estimatedEffort">> }>(
        [{ role: "user", content: `Generate 2-5 SMART objectives for goal "${goal.title}". Description: ${goal.description}` }],
        schema
      );
      if (result.objectives && result.objectives.length > 0) {
        return result.objectives.map((objective, index: number) => ({
          id: `obj-${goal.id}-${index + 1}`,
          goalId: goal.id,
          title: objective.title,
          description: objective.description,
          successCriteria: objective.successCriteria ?? [],
          estimatedEffort: objective.estimatedEffort ?? "medium",
        }));
      }
    }
  } catch {
    // fall through to stub
  }

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

  try {
    const { structuredOutput }: {
      structuredOutput: <T>(
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
        schema: string,
        options?: Record<string, unknown>
      ) => Promise<T>;
    } = require("../llm");
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && objectives.length > 0) {
      const schema = `{"tasks": [{"objectiveId": "string", "title": "string", "description": "string", "order": 1, "dependsOn": ["string"]}]}`;
      const prompt = objectives.map((objective) => `${objective.id}: ${objective.title} — ${objective.description}`).join("\n");
      const result = await structuredOutput<{ tasks: Array<Pick<PlannedTask, "objectiveId" | "title" | "description" | "order" | "dependsOn">> }>(
        [{ role: "user", content: `Break these objectives into an ordered dependency-aware task list.\n${prompt}` }],
        schema
      );
      if (result.tasks && result.tasks.length > 0) {
        return result.tasks.map((task, index: number) => ({
          id: `task-${task.objectiveId ?? objectives[Math.min(index, objectives.length - 1)]?.id}-${index + 1}`,
          objectiveId: task.objectiveId ?? objectives[Math.min(index, objectives.length - 1)]?.id ?? "unknown-objective",
          title: task.title,
          description: task.description,
          order: typeof task.order === "number" ? task.order : index + 1,
          dependsOn: task.dependsOn ?? [],
        }));
      }
    }
  } catch {
    // fall through to stub
  }

  for (const obj of objectives) {
    logInfo("planner_tasks_planned", { objectiveId: obj.id });
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
