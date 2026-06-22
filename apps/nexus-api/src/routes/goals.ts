import { randomUUID } from "crypto";
import { Request, Response, Router } from "express";
import { env } from "../config/env";
import { parseGoalType, Goal } from "../entities/Goal";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { GoalService } from "../services/goalService";
import { GoalRepository } from "../database/repositories/GoalRepository";

const router = Router();
const goalService = new GoalService();
const goalRepository = new GoalRepository();
const memoryGoals = new Map<string, Goal>();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const goalType = typeof req.query.goalType === "string" ? req.query.goalType : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const goals = env.DATABASE_URL
      ? await goalRepository.list({ goalType, status })
      : Array.from(memoryGoals.values()).filter(
          (goal) => (!goalType || goal.goalType === goalType) && (!status || goal.status === status)
        );

    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";

    if (!title || !description) {
      res.status(400).json({ error: "title and description are required" });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const goal: Goal = {
      id: randomUUID(),
      title,
      description,
      goalType: parseGoalType(req.body.goalType),
      industry: typeof req.body.industry === "string" ? req.body.industry : null,
      priority: req.body.priority === "critical" || req.body.priority === "high" || req.body.priority === "low" ? req.body.priority : "medium",
      status:
        req.body.status === "analyzing" ||
        req.body.status === "planned" ||
        req.body.status === "in_progress" ||
        req.body.status === "blocked" ||
        req.body.status === "completed" ||
        req.body.status === "cancelled"
          ? req.body.status
          : "draft",
      targetDate: typeof req.body.targetDate === "string" ? req.body.targetDate : null,
      successCriteria: Array.isArray(req.body.successCriteria)
        ? req.body.successCriteria.filter((item: unknown): item is string => typeof item === "string")
        : [],
      estimatedImpact: typeof req.body.estimatedImpact === "string" ? req.body.estimatedImpact : null,
      estimatedValue: typeof req.body.estimatedValue === "number" ? req.body.estimatedValue : null,
      createdBy: authReq.user?.id ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await goalRepository.create(goal) : null;
    const result = persisted ?? goal;

    if (!persisted && !env.DATABASE_URL) {
      memoryGoals.set(result.id, result);
    }

    await goalService.captureGoalCreation(result);
    const decomposition = await goalService.decomposeGoal(result);
    const roadmap = await goalService.orchestrateGoal(result, decomposition);

    res.status(201).json({ goal: result, decomposition, roadmap });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const goal = env.DATABASE_URL
      ? await goalRepository.getById(req.params.id)
      : memoryGoals.get(req.params.id) ?? null;

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    res.json({ goal });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const existing = env.DATABASE_URL
      ? await goalRepository.getById(req.params.id)
      : memoryGoals.get(req.params.id) ?? null;

    if (!existing) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const updateInput = {
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      description: typeof req.body.description === "string" ? req.body.description : undefined,
      goalType: req.body.goalType ? parseGoalType(req.body.goalType) : undefined,
      industry: typeof req.body.industry === "string" ? req.body.industry : req.body.industry === null ? null : undefined,
      priority: req.body.priority === "critical" || req.body.priority === "high" || req.body.priority === "medium" || req.body.priority === "low" ? req.body.priority : undefined,
      status:
        req.body.status === "draft" ||
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
        ? req.body.successCriteria.filter((item: unknown): item is string => typeof item === "string")
        : undefined,
      estimatedImpact: typeof req.body.estimatedImpact === "string" ? req.body.estimatedImpact : req.body.estimatedImpact === null ? null : undefined,
      estimatedValue: typeof req.body.estimatedValue === "number" ? req.body.estimatedValue : req.body.estimatedValue === null ? null : undefined,
    };

    const updated = env.DATABASE_URL
      ? await goalRepository.update(req.params.id, updateInput)
      : {
          ...existing,
          ...updateInput,
          updatedAt: new Date().toISOString(),
        };

    if (!updated) {
      res.status(500).json({ error: "Unable to update goal" });
      return;
    }

    if (!env.DATABASE_URL) {
      memoryGoals.set(updated.id, updated);
    }

    await goalService.captureGoalUpdate(updated);
    const outcome = updated.status === "completed" || updated.status === "cancelled"
      ? await goalService.captureGoalOutcome(updated)
      : undefined;

    res.json({ goal: updated, outcome });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = env.DATABASE_URL
      ? await goalRepository.delete(req.params.id)
      : memoryGoals.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/:id/decompose", async (req: Request, res: Response) => {
  try {
    const goal = env.DATABASE_URL
      ? await goalRepository.getById(req.params.id)
      : memoryGoals.get(req.params.id) ?? null;

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const decomposition = await goalService.decomposeGoal(goal);
    res.json({ decomposition });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/:id/orchestrate", async (req: Request, res: Response) => {
  try {
    const goal = env.DATABASE_URL
      ? await goalRepository.getById(req.params.id)
      : memoryGoals.get(req.params.id) ?? null;

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const decomposition = await goalService.decomposeGoal(goal);
    const roadmap = await goalService.orchestrateGoal(goal, decomposition);
    res.json({ roadmap, decomposition });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id/timeline", async (req: Request, res: Response) => {
  try {
    const goal = env.DATABASE_URL
      ? await goalRepository.getById(req.params.id)
      : memoryGoals.get(req.params.id) ?? null;

    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const decomposition = await goalService.decomposeGoal(goal);
    res.json({ timeline: decomposition.milestones });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
