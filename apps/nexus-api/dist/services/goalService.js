"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
const planner_1 = require("./planner");
const GoalOrchestrator_1 = require("./orchestrator/GoalOrchestrator");
const memory_1 = require("./memory");
const learning_1 = require("./learning");
const GOAL_DELIVERABLE_CATALOG = [
    "Business Plans",
    "Strategic Plans",
    "Financial Models",
    "Marketing Systems",
    "Hiring Systems",
    "Websites",
    "Applications",
    "Logos",
    "Brand Systems",
    "Packaging",
    "Presentations",
    "Menus",
    "Recipes",
    "Recipe Costing",
    "Training Programs",
    "SOPs",
    "Hospitality Blueprints",
    "Operational Frameworks",
];
function inferRequirements(goal) {
    const content = `${goal.title} ${goal.description} ${goal.goalType}`.toLowerCase();
    const requirements = [
        "Define success metrics and acceptance criteria",
        "Identify budget, timeline, and stakeholders",
        "Map cross-functional dependencies",
    ];
    const researchRequirements = [
        "Market and competitive intelligence",
        "Feasibility and risk analysis",
        "Capability and resource assessment",
    ];
    const productionRequirements = [
        "Delivery architecture and implementation sequencing",
        "Quality assurance and governance framework",
        "Launch and operational readiness plan",
    ];
    if (content.includes("resort") || content.includes("hotel") || content.includes("restaurant")) {
        requirements.push("Hospitality concept validation and blueprint scope");
        productionRequirements.push("Hospitality operations and guest journey design");
    }
    if (content.includes("brand") || content.includes("marketing")) {
        requirements.push("Brand strategy and positioning definition");
        productionRequirements.push("Marketing system production and campaign orchestration");
    }
    return { requirements, researchRequirements, productionRequirements };
}
function inferMissingInformation(goal) {
    const missing = [];
    if (!goal.industry) {
        missing.push("Target industry and segment are not specified");
    }
    if (!goal.targetDate) {
        missing.push("Target date is not specified");
    }
    if (goal.successCriteria.length === 0) {
        missing.push("Success criteria are not defined");
    }
    if (goal.estimatedValue == null) {
        missing.push("Estimated value is not provided");
    }
    return missing;
}
function buildMilestones(goal) {
    const start = Date.now();
    return [
        { id: `${goal.id}-m1`, title: "Discovery and analysis complete", dueDate: new Date(start + 7 * 86400000).toISOString(), status: "pending" },
        { id: `${goal.id}-m2`, title: "Execution plan approved", dueDate: new Date(start + 21 * 86400000).toISOString(), status: "pending" },
        { id: `${goal.id}-m3`, title: "Production assets delivered", dueDate: new Date(start + 45 * 86400000).toISOString(), status: "pending" },
    ];
}
function buildDeliverables(goal) {
    const content = `${goal.title} ${goal.description}`.toLowerCase();
    const selected = GOAL_DELIVERABLE_CATALOG.filter((item) => {
        if (content.includes("resort") || content.includes("hotel") || content.includes("restaurant")) {
            return [
                "Business Plans",
                "Financial Models",
                "Menus",
                "Recipes",
                "Recipe Costing",
                "Training Programs",
                "SOPs",
                "Hospitality Blueprints",
                "Operational Frameworks",
            ].includes(item);
        }
        return [
            "Business Plans",
            "Strategic Plans",
            "Financial Models",
            "Marketing Systems",
            "Websites",
            "Applications",
            "Brand Systems",
            "Presentations",
        ].includes(item);
    });
    return selected.map((name, index) => ({
        id: `${goal.id}-deliverable-${index + 1}`,
        name,
        category: name.split(" ")[0] ?? "General",
        description: `Generated as part of the execution pathway for ${goal.title}`,
    }));
}
class GoalService {
    constructor(orchestrator = new GoalOrchestrator_1.GoalOrchestrator()) {
        this.orchestrator = orchestrator;
    }
    async decomposeGoal(goal) {
        const { requirements, researchRequirements, productionRequirements } = inferRequirements(goal);
        const missingInformation = inferMissingInformation(goal);
        const plannerPlan = await (0, planner_1.buildPlan)({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            priority: goal.priority,
        });
        const objectives = plannerPlan.objectives.map((objective) => objective.title);
        const projects = [
            `${goal.title} — Discovery Project`,
            `${goal.title} — Build Project`,
            `${goal.title} — Launch Project`,
        ];
        const executionPlan = plannerPlan.tasks
            .sort((a, b) => a.order - b.order)
            .map((task) => `${task.order}. ${task.title}`);
        const dependencies = plannerPlan.tasks.flatMap((task) => task.dependsOn.map((dependency) => `${task.id} depends on ${dependency}`));
        return {
            goalId: goal.id,
            analysis: [
                `Goal type classified as ${goal.goalType}`,
                `Priority assessed as ${goal.priority}`,
                "Cross-domain orchestration requirements identified",
            ],
            requirements,
            missingInformation,
            objectives,
            projects,
            researchRequirements,
            productionRequirements,
            executionPlan,
            dependencies,
            milestones: buildMilestones(goal),
            deliverables: buildDeliverables(goal),
            generatedAt: new Date().toISOString(),
        };
    }
    async orchestrateGoal(goal, decomposition) {
        return this.orchestrator.orchestrate(goal, decomposition);
    }
    async captureGoalCreation(goal) {
        await (0, memory_1.upsertProjectMemory)({
            projectId: goal.id,
            name: goal.title,
            goals: [goal.title],
            completedObjectives: [],
            activeObjectives: [],
            keyDecisions: [`Goal created with type ${goal.goalType}`],
            tags: ["goal", goal.goalType, goal.priority],
            notes: goal.description,
        });
        await (0, learning_1.captureSignal)({
            userId: goal.createdBy ?? "system",
            entityType: "goal",
            entityId: goal.id,
            signal: "accepted",
            context: { event: "goal_created", goalType: goal.goalType },
        });
    }
    async captureGoalUpdate(goal) {
        await (0, learning_1.captureSignal)({
            userId: goal.createdBy ?? "system",
            entityType: "goal",
            entityId: goal.id,
            signal: "modified",
            context: { event: "goal_updated", status: goal.status },
        });
    }
    async captureGoalOutcome(goal) {
        await (0, learning_1.captureSignal)({
            userId: goal.createdBy ?? "system",
            entityType: "goal",
            entityId: goal.id,
            signal: goal.status === "completed" ? "accepted" : "rejected",
            context: { event: "goal_outcome", status: goal.status },
        });
        const insights = await (0, learning_1.generateInsights)("goal");
        return {
            recommendations: insights.map((insight) => insight.description),
        };
    }
}
exports.GoalService = GoalService;
//# sourceMappingURL=goalService.js.map