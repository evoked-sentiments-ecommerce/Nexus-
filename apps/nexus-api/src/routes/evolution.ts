import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import {
  analyseUsage,
  buildEvolutionReport,
  generateProposals,
  generateRecommendations,
} from "../services/evolution";
import { env } from "../config/env";
import {
  EvolutionProposalRecord,
  EvolutionProposalRepository,
} from "../database/repositories";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const proposalRepository = new EvolutionProposalRepository();
const memoryProposals = new Map<string, EvolutionProposalRecord>();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    const proposals = env.DATABASE_URL
      ? await proposalRepository.list(projectId)
      : Array.from(memoryProposals.values()).filter(
          (proposal) => !projectId || proposal.projectId === projectId
        );
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    const category = typeof req.body.category === "string" ? req.body.category : "infrastructure";

    if (!title || !description) {
      res.status(400).json({ error: "title and description are required" });
      return;
    }

    const proposal: EvolutionProposalRecord = {
      id: randomUUID(),
      projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
      title,
      description,
      category,
      priority: typeof req.body.priority === "string" ? req.body.priority : "medium",
      status: typeof req.body.status === "string" ? req.body.status : "proposed",
      analysisPeriod:
        typeof req.body.analysisPeriod === "string" ? req.body.analysisPeriod : "last_30_days",
      evidence: Array.isArray(req.body.evidence)
        ? req.body.evidence.filter((value: unknown): value is string => typeof value === "string")
        : [],
      metadata:
        req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await proposalRepository.create(proposal) : null;
    const result = persisted ?? proposal;
    if (!persisted && !env.DATABASE_URL) {
      memoryProposals.set(result.id, result);
    }

    res.status(201).json({ proposal: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const proposal = env.DATABASE_URL
      ? await proposalRepository.getById(req.params.id)
      : memoryProposals.get(req.params.id) ?? null;

    if (!proposal) {
      res.status(404).json({ error: "Evolution proposal not found" });
      return;
    }

    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const existing = env.DATABASE_URL
      ? await proposalRepository.getById(req.params.id)
      : memoryProposals.get(req.params.id) ?? null;

    if (!existing) {
      res.status(404).json({ error: "Evolution proposal not found" });
      return;
    }

    const updateInput = {
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      description: typeof req.body.description === "string" ? req.body.description : undefined,
      category: typeof req.body.category === "string" ? req.body.category : undefined,
      priority: typeof req.body.priority === "string" ? req.body.priority : undefined,
      status: typeof req.body.status === "string" ? req.body.status : undefined,
      analysisPeriod: typeof req.body.analysisPeriod === "string" ? req.body.analysisPeriod : undefined,
      evidence: Array.isArray(req.body.evidence)
        ? req.body.evidence.filter((value: unknown): value is string => typeof value === "string")
        : undefined,
      metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
    };

    const updated = env.DATABASE_URL
      ? await proposalRepository.update(req.params.id, updateInput)
      : {
          ...existing,
          ...updateInput,
          evidence: updateInput.evidence ?? existing.evidence,
          metadata: updateInput.metadata ?? existing.metadata,
          updatedAt: new Date().toISOString(),
        };

    if (!updated) {
      res.status(500).json({ error: "Unable to update evolution proposal" });
      return;
    }

    if (!env.DATABASE_URL) {
      memoryProposals.set(updated.id, updated);
    }

    res.json({ proposal: updated });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = env.DATABASE_URL
      ? await proposalRepository.delete(req.params.id)
      : memoryProposals.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Evolution proposal not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const period = typeof req.body.period === "string" ? req.body.period : "last_30_days";
    const usageAnalysis = await analyseUsage(period);
    const proposals = await generateProposals(usageAnalysis);
    const recommendations = await generateRecommendations(proposals);
    res.json({ usageAnalysis, proposals, recommendations });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/report", async (req: Request, res: Response) => {
  try {
    const period = typeof req.body.period === "string" ? req.body.period : "last_30_days";
    const report = await buildEvolutionReport(period);
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
