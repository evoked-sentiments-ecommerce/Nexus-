import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { ProjectRepository } from "../database/repositories";
import {
  type CreateProjectInput,
  type Project,
  type ProjectPriority,
  type ProjectStatus,
  type UpdateProjectInput,
} from "../entities/Project";

type ProjectsRouterOptions = {
  requireAuth?: RequestHandler;
};

const projectRepository = new ProjectRepository();

const isValidStatus = (status: unknown): status is ProjectStatus =>
  typeof status === "string" &&
  ["planned", "active", "blocked", "completed"].includes(status);

const isValidPriority = (priority: unknown): priority is ProjectPriority =>
  typeof priority === "string" &&
  ["low", "medium", "high", "critical"].includes(priority);

const nowIso = () => new Date().toISOString();
const projectId = () => `prj_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateProjectInput | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Partial<CreateProjectInput>;
  if (!candidate.title || typeof candidate.title !== "string") {
    return null;
  }

  if (!candidate.ownerId || typeof candidate.ownerId !== "string") {
    return null;
  }

  if (candidate.status && !isValidStatus(candidate.status)) {
    return null;
  }

  if (candidate.priority && !isValidPriority(candidate.priority)) {
    return null;
  }

  if (
    candidate.description !== undefined &&
    typeof candidate.description !== "string"
  ) {
    return null;
  }

  return {
    title: candidate.title,
    description: candidate.description,
    status: candidate.status,
    priority: candidate.priority,
    ownerId: candidate.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdateProjectInput | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Partial<
    UpdateProjectInput & { id?: unknown; ownerId?: unknown; createdAt?: unknown }
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

  if (candidate.priority !== undefined && !isValidPriority(candidate.priority)) {
    return null;
  }

  return {
    title: candidate.title,
    description: candidate.description,
    status: candidate.status,
    priority: candidate.priority,
  };
};

export const createProjectsRouter = (
  options: ProjectsRouterOptions = {},
): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", async (_req, res) => {
    try {
      const projects = await projectRepository.findAll();
      res.json(projects);
    } catch {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  router.get("/:id", async (req, res) => {
    let project: Project | null = null;
    try {
      project = await projectRepository.findById(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to fetch project" });
      return;
    }

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(project);
  });

  router.post("/", async (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid project payload" });
      return;
    }

    const createdAt = nowIso();
    const project: Project = {
      id: projectId(),
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "planned",
      priority: input.priority ?? "medium",
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    try {
      const created = await projectRepository.create(project);
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  router.put("/:id", async (req, res) => {
    let existing: Project | null = null;
    try {
      existing = await projectRepository.findById(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to fetch project" });
      return;
    }

    if (!existing) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid project payload" });
      return;
    }

    const updated: Project = {
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

    if (updates.priority !== undefined) {
      updated.priority = updates.priority;
    }

    try {
      const persisted = await projectRepository.update(updated);
      if (!persisted) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json(persisted);
    } catch {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  router.delete("/:id", async (req, res) => {
    let removed = false;
    try {
      removed = await projectRepository.delete(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to delete project" });
      return;
    }

    if (!removed) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createProjectsRouter;
