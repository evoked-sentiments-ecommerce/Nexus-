"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express_1 = require("express");
const design_intelligence_1 = require("../services/design-intelligence");
const env_1 = require("../config/env");
const repositories_1 = require("../database/repositories");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const brandRepository = new repositories_1.BrandRepository();
const memoryBrands = new Map();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/", async (req, res) => {
    try {
        const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
        const brands = env_1.env.DATABASE_URL
            ? await brandRepository.list(projectId)
            : Array.from(memoryBrands.values()).filter((brand) => !projectId || brand.projectId === projectId);
        res.json({ brands });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        if (!name) {
            res.status(400).json({ error: "Brand name is required" });
            return;
        }
        const brand = {
            id: (0, crypto_1.randomUUID)(),
            projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
            name,
            primaryColor: typeof req.body.primaryColor === "string" ? req.body.primaryColor : "#111111",
            secondaryColor: typeof req.body.secondaryColor === "string" ? req.body.secondaryColor : "#FFFFFF",
            accentColor: typeof req.body.accentColor === "string" ? req.body.accentColor : "#E76F51",
            fontPrimary: typeof req.body.fontPrimary === "string" ? req.body.fontPrimary : "Inter",
            fontSecondary: typeof req.body.fontSecondary === "string" ? req.body.fontSecondary : "Inter",
            logoUrl: typeof req.body.logoUrl === "string" ? req.body.logoUrl : null,
            tagline: typeof req.body.tagline === "string" ? req.body.tagline : null,
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL ? await brandRepository.create(brand) : null;
        const result = persisted ?? brand;
        if (!persisted && !env_1.env.DATABASE_URL) {
            memoryBrands.set(result.id, result);
        }
        res.status(201).json({ brand: result });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const brand = env_1.env.DATABASE_URL
            ? await brandRepository.getById(req.params.id)
            : memoryBrands.get(req.params.id) ?? null;
        if (!brand) {
            res.status(404).json({ error: "Brand not found" });
            return;
        }
        res.json({ brand });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const existing = env_1.env.DATABASE_URL
            ? await brandRepository.getById(req.params.id)
            : memoryBrands.get(req.params.id) ?? null;
        if (!existing) {
            res.status(404).json({ error: "Brand not found" });
            return;
        }
        const updateInput = {
            name: typeof req.body.name === "string" ? req.body.name : undefined,
            primaryColor: typeof req.body.primaryColor === "string" ? req.body.primaryColor : undefined,
            secondaryColor: typeof req.body.secondaryColor === "string" ? req.body.secondaryColor : undefined,
            accentColor: typeof req.body.accentColor === "string" ? req.body.accentColor : undefined,
            fontPrimary: typeof req.body.fontPrimary === "string" ? req.body.fontPrimary : undefined,
            fontSecondary: typeof req.body.fontSecondary === "string" ? req.body.fontSecondary : undefined,
            logoUrl: typeof req.body.logoUrl === "string" ? req.body.logoUrl : req.body.logoUrl === null ? null : undefined,
            tagline: typeof req.body.tagline === "string" ? req.body.tagline : req.body.tagline === null ? null : undefined,
            metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
        };
        const updated = env_1.env.DATABASE_URL
            ? await brandRepository.update(req.params.id, updateInput)
            : {
                ...existing,
                ...updateInput,
                metadata: updateInput.metadata ?? existing.metadata,
                updatedAt: new Date().toISOString(),
            };
        if (!updated) {
            res.status(500).json({ error: "Unable to update brand" });
            return;
        }
        if (!env_1.env.DATABASE_URL) {
            memoryBrands.set(updated.id, updated);
        }
        res.json({ brand: updated });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const deleted = env_1.env.DATABASE_URL
            ? await brandRepository.delete(req.params.id)
            : memoryBrands.delete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Brand not found" });
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
        const brand = env_1.env.DATABASE_URL
            ? await brandRepository.getById(req.params.id)
            : memoryBrands.get(req.params.id) ?? null;
        if (!brand) {
            res.status(404).json({ error: "Brand not found" });
            return;
        }
        const assetType = typeof req.body.assetType === "string" ? req.body.assetType : "brand_system";
        const outputFormats = Array.isArray(req.body.outputFormats)
            ? req.body.outputFormats.filter((value) => typeof value === "string")
            : ["pdf", "svg"];
        const asset = await (0, design_intelligence_1.generateAsset)({
            requestId: `brand-${brand.id}-${Date.now()}`,
            assetType: assetType,
            brandName: brand.name,
            brandTokens: {
                primaryColor: brand.primaryColor,
                secondaryColor: brand.secondaryColor,
                accentColor: brand.accentColor,
                fontPrimary: brand.fontPrimary,
                fontSecondary: brand.fontSecondary,
                logoUrl: brand.logoUrl ?? undefined,
                tagline: brand.tagline ?? undefined,
            },
            outputFormats: outputFormats,
            context: req.body.context && typeof req.body.context === "object" ? req.body.context : {},
        });
        res.json({ asset });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=brands.js.map