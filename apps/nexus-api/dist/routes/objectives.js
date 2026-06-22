"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express_1 = require("express");
const env_1 = require("../config/env");
const repositories_1 = require("../database/repositories");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const objectiveRepository = new repositories_1.ObjectiveRepository();
const memoryObjectives = new Map();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
function buildOrchestration(objective) {
    return {
        objectiveId: objective.id,
        status: objective.orchestrationStatus,
        generatedAt: new Date().toISOString(),
        steps: [
            { id: `${objective.id}-research`, phase: "research", status: "queued" },
            { id: `${objective.id}-production`, phase: "production", status: "queued" },
            { id: `${objective.id}-delivery`, phase: "delivery", status: "queued" },
        ],
    };
}
router.get("/", async (req, res) => {
    try {
        const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
        const objectives = env_1.env.DATABASE_URL
            ? await objectiveRepository.list(projectId)
            : Array.from(memoryObjectives.values()).filter((objective) => !projectId || objective.projectId === projectId);
        res.json({ objectives });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const projectId = typeof req.body.projectId === "string" ? req.body.projectId : "";
        if (!title || !projectId) {
            res.status(400).json({ error: "projectId and title are required" });
            return;
        }
        const objective = {
            id: (0, crypto_1.randomUUID)(),
            projectId,
            title,
            description: typeof req.body.description === "string" ? req.body.description : null,
            status: typeof req.body.status === "string" ? req.body.status : "pending",
            priority: typeof req.body.priority === "string" ? req.body.priority : "medium",
            dueDate: typeof req.body.dueDate === "string" ? req.body.dueDate : null,
            orchestrationStatus: typeof req.body.orchestrationStatus === "string" ? req.body.orchestrationStatus : "idle",
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL ? await objectiveRepository.create(objective) : null;
        const result = persisted ?? objective;
        if (!persisted && !env_1.env.DATABASE_URL) {
            memoryObjectives.set(result.id, result);
        }
        res.status(201).json({ objective: result });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const objective = env_1.env.DATABASE_URL
            ? await objectiveRepository.getById(req.params.id)
            : memoryObjectives.get(req.params.id) ?? null;
        if (!objective) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }
        res.json({ objective });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await objectiveRepository.getById(req.params.id)
            : memoryObjectives.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }
        const updateInput = {
            title: typeof req.body.title === "string" ? req.body.title : undefined,
            description: typeof req.body.description === "string" ? req.body.description : req.body.description === null ? null : undefined,
            status: typeof req.body.status === "string" ? req.body.status : undefined,
            priority: typeof req.body.priority === "string" ? req.body.priority : undefined,
            dueDate: typeof req.body.dueDate === "string" ? req.body.dueDate : req.body.dueDate === null ? null : undefined,
            orchestrationStatus: typeof req.body.orchestrationStatus === "string" ? req.body.orchestrationStatus : undefined,
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
        };
        const updated = env_1.env.DATABASE_URL
            ? await objectiveRepository.update(req.params.id, updateInput)
            : {
                ...existing,
                ...updateInput,
                metadata: updateInput.metadata ?? existing.metadata,
                updatedAt: new Date().toISOString(),
            };
        if (!updated) {
            res.status(500).json({ error: "Unable to update objective" });
            return;
        }
        if (!env_1.env.DATABASE_URL) {
            memoryObjectives.set(updated.id, updated);
        }
        res.json({ objective: updated });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const deleted = env_1.env.DATABASE_URL
            ? await objectiveRepository.delete(req.params.id)
            : memoryObjectives.delete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id/orchestration", async (req, res) => {
    try {
        const objective = env_1.env.DATABASE_URL
            ? await objectiveRepository.getById(req.params.id)
            : memoryObjectives.get(req.params.id) ?? null;
        if (!objective) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }
        res.json({ orchestration: buildOrchestration(objective) });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/:id/orchestrate", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await objectiveRepository.getById(req.params.id)
            : memoryObjectives.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Objective not found" });
            return;
        }
        const nextStatus = typeof req.body.status === "string" ? req.body.status : "scheduled";
        const updated = env_1.env.DATABASE_URL
            ? await objectiveRepository.update(req.params.id, { orchestrationStatus: nextStatus })
            : {
                ...existing,
                orchestrationStatus: nextStatus,
                updatedAt: new Date().toISOString(),
            };
        if (!updated) {
            res.status(500).json({ error: "Unable to orchestrate objective" });
            return;
        }
        if (!env_1.env.DATABASE_URL) {
            memoryObjectives.set(updated.id, updated);
        }
        res.json({ objective: updated, orchestration: buildOrchestration(updated) });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=objectives.js.map