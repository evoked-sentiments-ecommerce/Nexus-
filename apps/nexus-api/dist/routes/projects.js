"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express_1 = require("express");
const env_1 = require("../config/env");
const repositories_1 = require("../database/repositories");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const projectRepository = new repositories_1.ProjectRepository();
const memoryProjects = new Map();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/", async (req, res) => {
    try {
        const authReq = req;
        const ownerId = authReq.user?.id;
        const projects = env_1.env.DATABASE_URL
            ? await projectRepository.list(ownerId)
            : Array.from(memoryProjects.values()).filter((project) => project.ownerId === ownerId);
        res.json({ projects });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const authReq = req;
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        if (!name) {
            res.status(400).json({ error: "Project name is required" });
            return;
        }
        const project = {
            id: (0, crypto_1.randomUUID)(),
            ownerId: authReq.user?.id ?? null,
            name,
            description: typeof req.body.description === "string" ? req.body.description : null,
            status: typeof req.body.status === "string" ? req.body.status : "draft",
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL ? await projectRepository.create(project) : null;
        const result = persisted ?? project;
        if (!persisted && !env_1.env.DATABASE_URL) {
            memoryProjects.set(result.id, result);
        }
        res.status(201).json({ project: result });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const project = env_1.env.DATABASE_URL
            ? await projectRepository.getById(req.params.id)
            : memoryProjects.get(req.params.id) ?? null;
        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        res.json({ project });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await projectRepository.getById(req.params.id)
            : memoryProjects.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        const updateInput = {
            name: typeof req.body.name === "string" ? req.body.name : undefined,
            description: typeof req.body.description === "string" ? req.body.description : req.body.description === null ? null : undefined,
            status: typeof req.body.status === "string" ? req.body.status : undefined,
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
        };
        const updated = env_1.env.DATABASE_URL
            ? await projectRepository.update(req.params.id, updateInput)
            : {
                ...existing,
                ...updateInput,
                metadata: updateInput.metadata ?? existing.metadata,
                updatedAt: new Date().toISOString(),
            };
        if (!updated) {
            res.status(500).json({ error: "Unable to update project" });
            return;
        }
        if (!env_1.env.DATABASE_URL) {
            memoryProjects.set(updated.id, updated);
        }
        res.json({ project: updated });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const deleted = env_1.env.DATABASE_URL
            ? await projectRepository.delete(req.params.id)
            : memoryProjects.delete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map