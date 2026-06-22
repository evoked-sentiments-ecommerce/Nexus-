import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { ObjectiveRepository } from "../database/repositories";
import {
  type CreateObjectiveInput,
  type Objective,
  type ObjectiveStatus,
  type UpdateObjectiveInput,
} from "../entities/Objective";

type ObjectivesRouterOptions = {
  requireAuth?: RequestHandler;
};

const objectiveRepository = new ObjectiveRepository();

const isValidStatus = (status: unknown): status is ObjectiveStatus =>
  typeof status === "string" &&
  ["not_started", "in_progress", "completed", "blocked"].includes(status);

const isValidProgress = (progress: unknown): progress is number =>
  typeof progress === "number" &&
  Number.isFinite(progress) &&
  progress >= 0 &&
  progress <= 100;

const nowIso = () => new Date().toISOString();
const objectiveId = () => `obj_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateObjectiveInput | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Partial<CreateObjectiveInput>;

  if (!candidate.projectId || typeof candidate.projectId !== "string") {
    return null;
  }

  if (!candidate.title || typeof candidate.title !== "string") {
    return null;
  }

  if (!candidate.ownerId || typeof candidate.ownerId !== "string") {
    return null;
  }

  if (candidate.status !== undefined && !isValidStatus(candidate.status)) {
    return null;
  }

  if (
    candidate.progress !== undefined &&
    !isValidProgress(candidate.progress)
  ) {
    return null;
  }

  if (
    candidate.description !== undefined &&
    typeof candidate.description !== "string"
  ) {
    return null;
  }

  if (
    candidate.targetDate !== undefined &&
    candidate.targetDate !== null &&
    typeof candidate.targetDate !== "string"
  ) {
    return null;
  }

  return {
    projectId: candidate.projectId,
    title: candidate.title,
    description: candidate.description,
    status: candidate.status,
    progress: candidate.progress,
    targetDate: candidate.targetDate,
    ownerId: candidate.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdateObjectiveInput | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Partial<
    UpdateObjectiveInput & {
      id?: unknown;
      projectId?: unknown;
      ownerId?: unknown;
      createdAt?: unknown;
    }
  >;

  if (candidate.title !== undefined && typeof candidate.title !== "string") {
    return null;
  }

  if (
    candidate.description !== undefined &&
    typeof candidate.description !== "string"
  ) {
    return null;
  }

  if (candidate.status !== undefined && !isValidStatus(candidate.status)) {
    return null;
  }

  if (
    candidate.progress !== undefined &&
    !isValidProgress(candidate.progress)
  ) {
    return null;
  }

  if (
    candidate.targetDate !== undefined &&
    candidate.targetDate !== null &&
    typeof candidate.targetDate !== "string"
  ) {
    return null;
  }

  return {
    title: candidate.title,
    description: candidate.description,
    status: candidate.status,
    progress: candidate.progress,
    targetDate: candidate.targetDate,
  };
};

export const createObjectivesRouter = (
  options: ObjectivesRouterOptions = {},
): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", async (_req, res) => {
    try {
      const objectives = await objectiveRepository.findAll();
      res.json(objectives);
    } catch {
      res.status(500).json({ error: "Failed to fetch objectives" });
    }
  });

  router.get("/:id", async (req, res) => {
    let objective: Objective | null = null;
    try {
      objective = await objectiveRepository.findById(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to fetch objective" });
      return;
    }

    if (!objective) {
      res.status(404).json({ error: "Objective not found" });
      return;
    }

    res.json(objective);
  });

  router.post("/", async (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid objective payload" });
      return;
    }

    const createdAt = nowIso();
    const objective: Objective = {
      id: objectiveId(),
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "not_started",
      progress: input.progress ?? 0,
      targetDate: input.targetDate ?? null,
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    try {
      const created = await objectiveRepository.create(objective);
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: "Failed to create objective" });
    }
  });

  router.put("/:id", async (req, res) => {
    let existing: Objective | null = null;
    try {
      existing = await objectiveRepository.findById(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to fetch objective" });
      return;
    }

    if (!existing) {
      res.status(404).json({ error: "Objective not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid objective payload" });
      return;
    }

    const updated: Objective = {
      ...existing,
      updatedAt: nowIso(),
    };

    if (updates.title !== undefined) {
      updated.title = updates.title;
    }

    if (updates.description !== undefined) {
      updated.description = updates.description;
    }

    if (updates.status !== undefined) {
      updated.status = updates.status;
    }

    if (updates.progress !== undefined) {
      updated.progress = updates.progress;
    }

    if (updates.targetDate !== undefined) {
      updated.targetDate = updates.targetDate;
    }

    try {
      const persisted = await objectiveRepository.update(updated);
      if (!persisted) {
        res.status(404).json({ error: "Objective not found" });
        return;
      }

      res.json(persisted);
    } catch {
      res.status(500).json({ error: "Failed to update objective" });
    }
  });

  router.delete("/:id", async (req, res) => {
    let removed = false;
    try {
      removed = await objectiveRepository.delete(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to delete objective" });
      return;
    }

    if (!removed) {
      res.status(404).json({ error: "Objective not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createObjectivesRouter;
