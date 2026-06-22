import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { generateAsset } from "../services/design-intelligence";
import { env } from "../config/env";
import { BrandRecord, BrandRepository } from "../database/repositories";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const brandRepository = new BrandRepository();
const memoryBrands = new Map<string, BrandRecord>();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    const brands = env.DATABASE_URL
      ? await brandRepository.list(projectId)
      : Array.from(memoryBrands.values()).filter((brand) => !projectId || brand.projectId === projectId);
    res.json({ brands });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      res.status(400).json({ error: "Brand name is required" });
      return;
    }

    const brand: BrandRecord = {
      id: randomUUID(),
      projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
      name,
      primaryColor: typeof req.body.primaryColor === "string" ? req.body.primaryColor : "#111111",
      secondaryColor: typeof req.body.secondaryColor === "string" ? req.body.secondaryColor : "#FFFFFF",
      accentColor: typeof req.body.accentColor === "string" ? req.body.accentColor : "#E76F51",
      fontPrimary: typeof req.body.fontPrimary === "string" ? req.body.fontPrimary : "Inter",
      fontSecondary: typeof req.body.fontSecondary === "string" ? req.body.fontSecondary : "Inter",
      logoUrl: typeof req.body.logoUrl === "string" ? req.body.logoUrl : null,
      tagline: typeof req.body.tagline === "string" ? req.body.tagline : null,
      metadata:
        req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await brandRepository.create(brand) : null;
    const result = persisted ?? brand;
    if (!persisted && !env.DATABASE_URL) {
      memoryBrands.set(result.id, result);
    }

    res.status(201).json({ brand: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const brand = env.DATABASE_URL
      ? await brandRepository.getById(req.params.id)
      : memoryBrands.get(req.params.id) ?? null;

    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    res.json({ brand });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const existing = env.DATABASE_URL
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

    const updated = env.DATABASE_URL
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

    if (!env.DATABASE_URL) {
      memoryBrands.set(updated.id, updated);
    }

    res.json({ brand: updated });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = env.DATABASE_URL
      ? await brandRepository.delete(req.params.id)
      : memoryBrands.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/:id/generate", async (req: Request, res: Response) => {
  try {
    const brand = env.DATABASE_URL
      ? await brandRepository.getById(req.params.id)
      : memoryBrands.get(req.params.id) ?? null;

    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    const assetType = typeof req.body.assetType === "string" ? req.body.assetType : "brand_system";
    const outputFormats = Array.isArray(req.body.outputFormats)
      ? req.body.outputFormats.filter((value: unknown): value is string => typeof value === "string")
      : ["pdf", "svg"];

    const asset = await generateAsset({
      requestId: `brand-${brand.id}-${Date.now()}`,
      assetType: assetType as never,
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
      outputFormats: outputFormats as never,
      context:
        req.body.context && typeof req.body.context === "object" ? req.body.context : {},
    });

    res.json({ asset });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
