import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { env } from "../config/env";
import {
  ResearchFindingRecord,
  ResearchFindingRepository,
} from "../database/repositories";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const researchRepository = new ResearchFindingRepository();
const memoryFindings = new Map<string, ResearchFindingRecord>();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    const findings = env.DATABASE_URL
      ? await researchRepository.list(projectId)
      : Array.from(memoryFindings.values()).filter(
          (finding) => !projectId || finding.projectId === projectId
        );
    res.json({ findings });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const topic = typeof req.body.topic === "string" ? req.body.topic.trim() : "";
    const summary = typeof req.body.summary === "string" ? req.body.summary.trim() : "";
    const details = typeof req.body.details === "string" ? req.body.details : "";
    const domain = typeof req.body.domain === "string" ? req.body.domain : "market";

    if (!topic || !summary || !details) {
      res.status(400).json({ error: "topic, summary, and details are required" });
      return;
    }

    const finding: ResearchFindingRecord = {
      id: randomUUID(),
      projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
      objectiveId: typeof req.body.objectiveId === "string" ? req.body.objectiveId : null,
      domain,
      topic,
      summary,
      details,
      sources: Array.isArray(req.body.sources)
        ? req.body.sources.filter((value: unknown): value is string => typeof value === "string")
        : [],
      confidence: typeof req.body.confidence === "string" ? req.body.confidence : "medium",
      relevanceScore: typeof req.body.relevanceScore === "number" ? req.body.relevanceScore : 0,
      metadata:
        req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await researchRepository.create(finding) : null;
    const result = persisted ?? finding;
    if (!persisted && !env.DATABASE_URL) {
      memoryFindings.set(result.id, result);
    }

    res.status(201).json({ finding: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const finding = env.DATABASE_URL
      ? await researchRepository.getById(req.params.id)
      : memoryFindings.get(req.params.id) ?? null;

    if (!finding) {
      res.status(404).json({ error: "Research finding not found" });
      return;
    }

    res.json({ finding });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const existing = env.DATABASE_URL
      ? await researchRepository.getById(req.params.id)
      : memoryFindings.get(req.params.id) ?? null;

    if (!existing) {
      res.status(404).json({ error: "Research finding not found" });
      return;
    }

    const updateInput = {
      domain: typeof req.body.domain === "string" ? req.body.domain : undefined,
      topic: typeof req.body.topic === "string" ? req.body.topic : undefined,
      summary: typeof req.body.summary === "string" ? req.body.summary : undefined,
      details: typeof req.body.details === "string" ? req.body.details : undefined,
      sources: Array.isArray(req.body.sources)
        ? req.body.sources.filter((value: unknown): value is string => typeof value === "string")
        : undefined,
      confidence: typeof req.body.confidence === "string" ? req.body.confidence : undefined,
      relevanceScore: typeof req.body.relevanceScore === "number" ? req.body.relevanceScore : undefined,
      metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
    };

    const updated = env.DATABASE_URL
      ? await researchRepository.update(req.params.id, updateInput)
      : {
          ...existing,
          ...updateInput,
          sources: updateInput.sources ?? existing.sources,
          metadata: updateInput.metadata ?? existing.metadata,
          updatedAt: new Date().toISOString(),
        };

    if (!updated) {
      res.status(500).json({ error: "Unable to update research finding" });
      return;
    }

    if (!env.DATABASE_URL) {
      memoryFindings.set(updated.id, updated);
    }

    res.json({ finding: updated });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = env.DATABASE_URL
      ? await researchRepository.delete(req.params.id)
      : memoryFindings.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Research finding not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
