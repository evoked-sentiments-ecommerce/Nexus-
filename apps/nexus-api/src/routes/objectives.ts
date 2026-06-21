import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import {
  type CreateObjectiveInput,
  type Objective,
  type ObjectiveStatus,
  type UpdateObjectiveInput,
} from "../entities/Objective";

type ObjectivesRouterOptions = {
  requireAuth?: RequestHandler;
};

const objectives = new Map<string, Objective>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

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

  router.get("/", (_req, res) => {
    res.json(Array.from(objectives.values()));
  });

  router.get("/:id", (req, res) => {
    const objective = objectives.get(req.params.id);
    if (!objective) {
      res.status(404).json({ error: "Objective not found" });
      return;
    }

    res.json(objective);
  });

  router.post("/", (req, res) => {
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

    objectives.set(objective.id, objective);
    res.status(201).json(objective);
  });

  router.put("/:id", (req, res) => {
    const existing = objectives.get(req.params.id);
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

    objectives.set(updated.id, updated);
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const removed = objectives.delete(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Objective not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createObjectivesRouter;
