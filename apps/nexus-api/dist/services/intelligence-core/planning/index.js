"use strict";
// ---------------------------------------------------------------------------
// Intelligence Core — Planning
// Goal decomposition, objective generation, task planning, and dependency-
// aware execution scheduling.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.decomposeGoal = decomposeGoal;
exports.generateObjectives = generateObjectives;
exports.planTasks = planTasks;
exports.buildExecutionPlan = buildExecutionPlan;
const logger_1 = require("../../logger");
// ---------------------------------------------------------------------------
// Goal decomposition (stub — replace with LLM)
// ---------------------------------------------------------------------------
async function decomposeGoal(goal) {
    (0, logger_1.logInfo)("planning_goal_decomposed", { goalId: goal.goalId });
    return [
        { goalId: `${goal.goalId}-research`, title: `Research: ${goal.title}`, description: `Assess feasibility and gather knowledge for: ${goal.description}`, priority: goal.priority, successCriteria: ["Findings documented"] },
        { goalId: `${goal.goalId}-design`, title: `Design: ${goal.title}`, description: `Architect the solution for: ${goal.description}`, priority: goal.priority, successCriteria: ["Architecture approved"] },
        { goalId: `${goal.goalId}-execute`, title: `Execute: ${goal.title}`, description: `Implement and deliver: ${goal.description}`, priority: goal.priority, successCriteria: ["Deliverables produced and verified"] },
    ];
}
// ---------------------------------------------------------------------------
// Objective generation (stub — replace with LLM)
// ---------------------------------------------------------------------------
async function generateObjectives(goal) {
    (0, logger_1.logInfo)("planning_objectives_generated", { goalId: goal.goalId });
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
async function planTasks(objectives) {
    const tasks = [];
    for (const obj of objectives) {
        (0, logger_1.logInfo)("planning_tasks_planned", { objectiveId: obj.objectiveId });
        tasks.push({ taskId: `task-${obj.objectiveId}-1`, objectiveId: obj.objectiveId, title: `Prepare for: ${obj.title}`, description: "Confirm prerequisites.", order: 1, dependsOn: [], status: "pending" }, { taskId: `task-${obj.objectiveId}-2`, objectiveId: obj.objectiveId, title: `Execute: ${obj.title}`, description: "Complete core work.", order: 2, dependsOn: [`task-${obj.objectiveId}-1`], status: "pending" }, { taskId: `task-${obj.objectiveId}-3`, objectiveId: obj.objectiveId, title: `Verify: ${obj.title}`, description: "Confirm success criteria.", order: 3, dependsOn: [`task-${obj.objectiveId}-2`], status: "pending" });
    }
    return tasks;
}
// ---------------------------------------------------------------------------
// Full planning pipeline
// ---------------------------------------------------------------------------
async function buildExecutionPlan(goal) {
    const objectives = await generateObjectives(goal);
    const tasks = await planTasks(objectives);
    const criticalPath = tasks.filter((t) => t.dependsOn.length === 0).map((t) => t.taskId);
    const plan = {
        planId: `plan-${goal.goalId}-${Date.now()}`,
        goalId: goal.goalId,
        objectives,
        tasks,
        estimatedDuration: "variable",
        criticalPath,
        createdAt: new Date().toISOString(),
    };
    (0, logger_1.logInfo)("planning_plan_built", {
        planId: plan.planId,
        goalId: goal.goalId,
        objectiveCount: objectives.length,
        taskCount: tasks.length,
    });
    return plan;
}
//# sourceMappingURL=index.js.map