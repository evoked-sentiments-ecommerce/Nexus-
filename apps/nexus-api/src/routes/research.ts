import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import {
  type CreateResearchItemInput,
  type ResearchItem,
  type ResearchItemStatus,
  type ResearchItemType,
  type UpdateResearchItemInput,
} from "../entities/ResearchItem";

type ResearchRouterOptions = {
  requireAuth?: RequestHandler;
};

const researchItems = new Map<string, ResearchItem>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

const VALID_TYPES: ResearchItemType[] = [
  "project",
  "note",
  "source",
  "finding",
  "attachment",
];

const VALID_STATUSES: ResearchItemStatus[] = [
  "draft",
  "in_review",
  "published",
  "archived",
];

const isValidType = (type: unknown): type is ResearchItemType =>
  typeof type === "string" && VALID_TYPES.includes(type as ResearchItemType);

const isValidStatus = (status: unknown): status is ResearchItemStatus =>
  typeof status === "string" &&
  VALID_STATUSES.includes(status as ResearchItemStatus);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const nowIso = () => new Date().toISOString();
const researchId = () => `res_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateResearchItemInput | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Partial<CreateResearchItemInput>;

  if (!candidate.projectId || typeof candidate.projectId !== "string") {
    return null;
  }

  if (!candidate.title || typeof candidate.title !== "string") {
    return null;
  }

  if (!candidate.ownerId || typeof candidate.ownerId !== "string") {
    return null;
  }

  if (!candidate.type || !isValidType(candidate.type)) {
    return null;
  }

  if (candidate.status !== undefined && !isValidStatus(candidate.status)) {
    return null;
  }

  if (
    candidate.objectiveId !== undefined &&
    candidate.objectiveId !== null &&
    typeof candidate.objectiveId !== "string"
  ) {
    return null;
  }

  if (candidate.notes !== undefined && typeof candidate.notes !== "string") {
    return null;
  }

  if (candidate.sources !== undefined && !isStringArray(candidate.sources)) {
    return null;
  }

  if (candidate.findings !== undefined && !isStringArray(candidate.findings)) {
    return null;
  }

  if (candidate.tags !== undefined && !isStringArray(candidate.tags)) {
    return null;
  }

  if (
    candidate.attachments !== undefined &&
    !isStringArray(candidate.attachments)
  ) {
    return null;
  }

  return {
    projectId: candidate.projectId,
    objectiveId: candidate.objectiveId,
    type: candidate.type,
    status: candidate.status,
    title: candidate.title,
    notes: candidate.notes,
    sources: candidate.sources,
    findings: candidate.findings,
    tags: candidate.tags,
    attachments: candidate.attachments,
    ownerId: candidate.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdateResearchItemInput | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Partial<
    UpdateResearchItemInput & {
      id?: unknown;
      projectId?: unknown;
      objectiveId?: unknown;
      ownerId?: unknown;
      createdAt?: unknown;
    }
  >;

  if (candidate.type !== undefined && !isValidType(candidate.type)) {
    return null;
  }

  if (candidate.status !== undefined && !isValidStatus(candidate.status)) {
    return null;
  }

  if (candidate.title !== undefined && typeof candidate.title !== "string") {
    return null;
  }

  if (candidate.notes !== undefined && typeof candidate.notes !== "string") {
    return null;
  }

  if (candidate.sources !== undefined && !isStringArray(candidate.sources)) {
    return null;
  }

  if (candidate.findings !== undefined && !isStringArray(candidate.findings)) {
    return null;
  }

  if (candidate.tags !== undefined && !isStringArray(candidate.tags)) {
    return null;
  }

  if (
    candidate.attachments !== undefined &&
    !isStringArray(candidate.attachments)
  ) {
    return null;
  }

  return {
    type: candidate.type,
    status: candidate.status,
    title: candidate.title,
    notes: candidate.notes,
    sources: candidate.sources,
    findings: candidate.findings,
    tags: candidate.tags,
    attachments: candidate.attachments,
  };
};

export const createResearchRouter = (
  options: ResearchRouterOptions = {},
): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", (_req, res) => {
    res.json(Array.from(researchItems.values()));
  });

  router.get("/:id", (req, res) => {
    const item = researchItems.get(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Research item not found" });
      return;
    }

    res.json(item);
  });

  router.post("/", (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid research item payload" });
      return;
    }

    const createdAt = nowIso();
    const item: ResearchItem = {
      id: researchId(),
      projectId: input.projectId,
      objectiveId: input.objectiveId ?? null,
      type: input.type,
      status: input.status ?? "draft",
      title: input.title,
      notes: input.notes ?? "",
      sources: input.sources ?? [],
      findings: input.findings ?? [],
      tags: input.tags ?? [],
      attachments: input.attachments ?? [],
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    researchItems.set(item.id, item);
    res.status(201).json(item);
  });

  router.put("/:id", (req, res) => {
    const existing = researchItems.get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Research item not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid research item payload" });
      return;
    }

    const updated: ResearchItem = {
      ...existing,
      updatedAt: nowIso(),
    };

    if (updates.type !== undefined) updated.type = updates.type;
    if (updates.status !== undefined) updated.status = updates.status;
    if (updates.title !== undefined) updated.title = updates.title;
    if (updates.notes !== undefined) updated.notes = updates.notes;
    if (updates.sources !== undefined) updated.sources = updates.sources;
    if (updates.findings !== undefined) updated.findings = updates.findings;
    if (updates.tags !== undefined) updated.tags = updates.tags;
    if (updates.attachments !== undefined)
      updated.attachments = updates.attachments;

    researchItems.set(updated.id, updated);
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const removed = researchItems.delete(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Research item not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createResearchRouter;
