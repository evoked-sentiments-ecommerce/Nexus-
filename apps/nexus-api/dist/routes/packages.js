"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express_1 = require("express");
const emailService_1 = require("../services/emailService");
const production_1 = require("../services/production");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const repositories_1 = require("../database/repositories");
const router = (0, express_1.Router)();
const packageRepository = new repositories_1.PackageRepository();
const memoryPackages = new Map();
/**
 * POST /api/packages/:id/ready
 * Triggered by the Package Engine when a package has finished generating.
 * Sends a download notification email to the requesting user.
 */
router.post("/:id/ready", async (req, res) => {
    try {
        const { id } = req.params;
        const { customerEmail, customerName, packageName, packageType, assetCount, fileSize, downloadUrl, expiresAt, } = req.body;
        await (0, emailService_1.sendPackageDownloadNotification)(customerEmail, {
            customerName,
            packageName,
            packageId: id,
            packageType,
            assetCount,
            fileSize,
            generatedAt: new Date(),
            downloadUrl,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });
        res.json({ success: true });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/", async (req, res) => {
    try {
        const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
        const packages = env_1.env.DATABASE_URL
            ? await packageRepository.list(projectId)
            : Array.from(memoryPackages.values()).filter((pkg) => !projectId || pkg.projectId === projectId);
        res.json({ packages });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const type = typeof req.body.type === "string" ? req.body.type : "custom";
        if (!name) {
            res.status(400).json({ error: "Package name is required" });
            return;
        }
        const pkg = {
            id: (0, crypto_1.randomUUID)(),
            projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
            objectiveId: typeof req.body.objectiveId === "string" ? req.body.objectiveId : null,
            documentId: typeof req.body.documentId === "string" ? req.body.documentId : null,
            name,
            type,
            status: typeof req.body.status === "string" ? req.body.status : "draft",
            manifestUrl: typeof req.body.manifestUrl === "string" ? req.body.manifestUrl : null,
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL ? await packageRepository.create(pkg) : null;
        const result = persisted ?? pkg;
        if (!persisted && !env_1.env.DATABASE_URL) {
            memoryPackages.set(result.id, result);
        }
        res.status(201).json({ package: result });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await packageRepository.getById(req.params.id)
            : memoryPackages.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Package not found" });
            return;
        }
        const updateInput = {
            name: typeof req.body.name === "string" ? req.body.name : undefined,
            type: typeof req.body.type === "string" ? req.body.type : undefined,
            status: typeof req.body.status === "string" ? req.body.status : undefined,
            manifestUrl: typeof req.body.manifestUrl === "string" ? req.body.manifestUrl : req.body.manifestUrl === null ? null : undefined,
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
        };
        const updated = env_1.env.DATABASE_URL
            ? await packageRepository.update(req.params.id, updateInput)
            : {
                ...existing,
                ...updateInput,
                metadata: updateInput.metadata ?? existing.metadata,
                updatedAt: new Date().toISOString(),
            };
        if (!updated) {
            res.status(500).json({ error: "Unable to update package" });
            return;
        }
        if (!env_1.env.DATABASE_URL) {
            memoryPackages.set(updated.id, updated);
        }
        res.json({ package: updated });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const deleted = env_1.env.DATABASE_URL
            ? await packageRepository.delete(req.params.id)
            : memoryPackages.delete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Package not found" });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/:id/generate", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await packageRepository.getById(req.params.id)
            : memoryPackages.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Package not found" });
            return;
        }
        const manifest = await (0, production_1.produce)({
            requestId: `pkg-${existing.id}-${Date.now()}`,
            category: "custom",
            title: existing.name,
            outputFormats: Array.isArray(req.body.outputFormats)
                ? req.body.outputFormats.filter((value) => typeof value === "string")
                : ["pdf", "json"],
            data: {
                package: existing,
                payload: req.body.payload && typeof req.body.payload === "object" ? req.body.payload : {},
            },
            requestedBy: req.user?.id,
            projectId: existing.projectId ?? undefined,
        });
        const manifestUrl = manifest.assets[0]?.outputUrls.json
            ?? manifest.assets[0]?.outputUrls.pdf
            ?? existing.manifestUrl;
        const updated = env_1.env.DATABASE_URL
            ? await packageRepository.update(existing.id, {
                status: "generated",
                manifestUrl: typeof manifestUrl === "string" ? manifestUrl : existing.manifestUrl,
                metadata: { ...existing.metadata, latestManifest: manifest.manifestId },
            })
            : {
                ...existing,
                status: "generated",
                manifestUrl: typeof manifestUrl === "string" ? manifestUrl : existing.manifestUrl,
                metadata: { ...existing.metadata, latestManifest: manifest.manifestId },
                updatedAt: new Date().toISOString(),
            };
        if (updated && !env_1.env.DATABASE_URL) {
            memoryPackages.set(updated.id, updated);
        }
        res.json({ package: updated ?? existing, manifest });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=packages.js.map