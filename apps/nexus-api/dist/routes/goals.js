"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express_1 = require("express");
const env_1 = require("../config/env");
const Goal_1 = require("../entities/Goal");
const auth_1 = require("../middleware/auth");
const goalService_1 = require("../services/goalService");
const GoalRepository_1 = require("../database/repositories/GoalRepository");
const router = (0, express_1.Router)();
const goalService = new goalService_1.GoalService();
const goalRepository = new GoalRepository_1.GoalRepository();
const memoryGoals = new Map();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/", async (req, res) => {
    try {
        const goalType = typeof req.query.goalType === "string" ? req.query.goalType : undefined;
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const goals = env_1.env.DATABASE_URL
            ? await goalRepository.list({ goalType, status })
            : Array.from(memoryGoals.values()).filter((goal) => (!goalType || goal.goalType === goalType) && (!status || goal.status === status));
        res.json({ goals });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
        if (!title || !description) {
            res.status(400).json({ error: "title and description are required" });
            return;
        }
        const authReq = req;
        const goal = {
            id: (0, crypto_1.randomUUID)(),
            title,
            description,
            goalType: (0, Goal_1.parseGoalType)(req.body.goalType),
            industry: typeof req.body.industry === "string" ? req.body.industry : null,
            priority: req.body.priority === "critical" || req.body.priority === "high" || req.body.priority === "low" ? req.body.priority : "medium",
            status: req.body.status === "analyzing" ||
                req.body.status === "planned" ||
                req.body.status === "in_progress" ||
                req.body.status === "blocked" ||
                req.body.status === "completed" ||
                req.body.status === "cancelled"
                ? req.body.status
                : "draft",
            targetDate: typeof req.body.targetDate === "string" ? req.body.targetDate : null,
            successCriteria: Array.isArray(req.body.successCriteria)
                ? req.body.successCriteria.filter((item) => typeof item === "string")
                : [],
            estimatedImpact: typeof req.body.estimatedImpact === "string" ? req.body.estimatedImpact : null,
            estimatedValue: typeof req.body.estimatedValue === "number" ? req.body.estimatedValue : null,
            createdBy: authReq.user?.id ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL ? await goalRepository.create(goal) : null;
        const result = persisted ?? goal;
        if (!persisted && !env_1.env.DATABASE_URL) {
            memoryGoals.set(result.id, result);
        }
        await goalService.captureGoalCreation(result);
        const decomposition = await goalService.decomposeGoal(result);
        const roadmap = await goalService.orchestrateGoal(result, decomposition);
        res.status(201).json({ goal: result, decomposition, roadmap });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const goal = env_1.env.DATABASE_URL
            ? await goalRepository.getById(req.params.id)
            : memoryGoals.get(req.params.id) ?? null;
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        res.json({ goal });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await goalRepository.getById(req.params.id)
            : memoryGoals.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const updateInput = {
            title: typeof req.body.title === "string" ? req.body.title : undefined,
            description: typeof req.body.description === "string" ? req.body.description : undefined,
            goalType: req.body.goalType ? (0, Goal_1.parseGoalType)(req.body.goalType) : undefined,
            industry: typeof req.body.industry === "string" ? req.body.industry : req.body.industry === null ? null : undefined,
            priority: req.body.priority === "critical" || req.body.priority === "high" || req.body.priority === "medium" || req.body.priority === "low" ? req.body.priority : undefined,
            status: req.body.status === "draft" ||
                req.body.status === "analyzing" ||
                req.body.status === "planned" ||
                req.body.status === "in_progress" ||
                req.body.status === "blocked" ||
                req.body.status === "completed" ||
                req.body.status === "cancelled"
                ? req.body.status
                : undefined,
            targetDate: typeof req.body.targetDate === "string" ? req.body.targetDate : req.body.targetDate === null ? null : undefined,
            successCriteria: Array.isArray(req.body.successCriteria)
                ? req.body.successCriteria.filter((item) => typeof item === "string")
                : undefined,
            estimatedImpact: typeof req.body.estimatedImpact === "string" ? req.body.estimatedImpact : req.body.estimatedImpact === null ? null : undefined,
            estimatedValue: typeof req.body.estimatedValue === "number" ? req.body.estimatedValue : req.body.estimatedValue === null ? null : undefined,
        };
        const updated = env_1.env.DATABASE_URL
            ? await goalRepository.update(req.params.id, updateInput)
            : {
                ...existing,
                title: updateInput.title ?? existing.title,
                description: updateInput.description ?? existing.description,
                goalType: updateInput.goalType ?? existing.goalType,
                industry: updateInput.industry !== undefined ? updateInput.industry : existing.industry,
                priority: updateInput.priority ?? existing.priority,
                status: updateInput.status ?? existing.status,
                targetDate: updateInput.targetDate !== undefined ? updateInput.targetDate : existing.targetDate,
                successCriteria: updateInput.successCriteria ?? existing.successCriteria,
                estimatedImpact: updateInput.estimatedImpact !== undefined
                    ? updateInput.estimatedImpact
                    : existing.estimatedImpact,
                estimatedValue: updateInput.estimatedValue !== undefined
                    ? updateInput.estimatedValue
                    : existing.estimatedValue,
                updatedAt: new Date().toISOString(),
            };
        if (!updated) {
            res.status(500).json({ error: "Unable to update goal" });
            return;
        }
        if (!env_1.env.DATABASE_URL) {
            memoryGoals.set(updated.id, updated);
        }
        await goalService.captureGoalUpdate(updated);
        const outcome = updated.status === "completed" || updated.status === "cancelled"
            ? await goalService.captureGoalOutcome(updated)
            : undefined;
        res.json({ goal: updated, outcome });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const deleted = env_1.env.DATABASE_URL
            ? await goalRepository.delete(req.params.id)
            : memoryGoals.delete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/:id/decompose", async (req, res) => {
    try {
        const goal = env_1.env.DATABASE_URL
            ? await goalRepository.getById(req.params.id)
            : memoryGoals.get(req.params.id) ?? null;
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const decomposition = await goalService.decomposeGoal(goal);
        res.json({ decomposition });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/:id/orchestrate", async (req, res) => {
    try {
        const goal = env_1.env.DATABASE_URL
            ? await goalRepository.getById(req.params.id)
            : memoryGoals.get(req.params.id) ?? null;
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const decomposition = await goalService.decomposeGoal(goal);
        const roadmap = await goalService.orchestrateGoal(goal, decomposition);
        res.json({ roadmap, decomposition });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id/timeline", async (req, res) => {
    try {
        const goal = env_1.env.DATABASE_URL
            ? await goalRepository.getById(req.params.id)
            : memoryGoals.get(req.params.id) ?? null;
        if (!goal) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const decomposition = await goalService.decomposeGoal(goal);
        res.json({ timeline: decomposition.milestones });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=goals.js.map