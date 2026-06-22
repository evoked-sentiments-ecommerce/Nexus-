import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import {
  type BlueprintFeature,
  type BlueprintStatus,
  type BlueprintType,
  type CreateHospitalityBlueprintInput,
  type HospitalityBlueprint,
  type UpdateHospitalityBlueprintInput,
} from "../entities/HospitalityBlueprint";

type ChefDrewRouterOptions = {
  requireAuth?: RequestHandler;
};

const blueprints = new Map<string, HospitalityBlueprint>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

const VALID_BLUEPRINT_TYPES: BlueprintType[] = [
  "restaurant",
  "hotel_fb",
  "resort",
  "private_club",
  "catering",
  "executive_advisory",
];

const VALID_FEATURES: BlueprintFeature[] = [
  "concept_development",
  "menu_engineering",
  "food_cost_models",
  "labor_models",
  "sop_generation",
  "training_program_generation",
  "revenue_strategy",
  "hospitality_operations_framework",
];

const VALID_STATUSES: BlueprintStatus[] = [
  "draft",
  "in_review",
  "approved",
  "active",
  "archived",
];

const isValidBlueprintType = (v: unknown): v is BlueprintType =>
  typeof v === "string" && VALID_BLUEPRINT_TYPES.includes(v as BlueprintType);

const isValidStatus = (v: unknown): v is BlueprintStatus =>
  typeof v === "string" && VALID_STATUSES.includes(v as BlueprintStatus);

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((item) => typeof item === "string");

const isValidFeaturesArray = (v: unknown): v is BlueprintFeature[] =>
  Array.isArray(v) &&
  v.every(
    (item) => typeof item === "string" && VALID_FEATURES.includes(item as BlueprintFeature),
  );

const nowIso = () => new Date().toISOString();
const blueprintId = () => `bp_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateHospitalityBlueprintInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<CreateHospitalityBlueprintInput>;

  if (!c.title || typeof c.title !== "string") return null;
  if (!c.projectId || typeof c.projectId !== "string") return null;
  if (!c.ownerId || typeof c.ownerId !== "string") return null;
  if (!c.blueprintType || !isValidBlueprintType(c.blueprintType)) return null;

  if (c.status !== undefined && !isValidStatus(c.status)) return null;
  if (c.features !== undefined && !isValidFeaturesArray(c.features)) return null;
  if (c.researchItemIds !== undefined && !isStringArray(c.researchItemIds)) return null;
  if (c.brandIds !== undefined && !isStringArray(c.brandIds)) return null;
  if (c.documentIds !== undefined && !isStringArray(c.documentIds)) return null;
  if (c.pdfTemplateIds !== undefined && !isStringArray(c.pdfTemplateIds)) return null;

  if (c.foodCostTarget !== undefined && c.foodCostTarget !== null && typeof c.foodCostTarget !== "number") return null;
  if (c.laborCostTarget !== undefined && c.laborCostTarget !== null && typeof c.laborCostTarget !== "number") return null;

  return {
    projectId: c.projectId,
    objectiveId: c.objectiveId ?? null,
    researchItemIds: c.researchItemIds,
    brandIds: c.brandIds,
    documentIds: c.documentIds,
    pdfTemplateIds: c.pdfTemplateIds,
    title: c.title,
    description: c.description,
    blueprintType: c.blueprintType,
    features: c.features,
    conceptNotes: c.conceptNotes,
    menuEngineering: c.menuEngineering,
    foodCostTarget: c.foodCostTarget ?? null,
    laborCostTarget: c.laborCostTarget ?? null,
    revenueStrategy: c.revenueStrategy,
    operationsFramework: c.operationsFramework,
    status: c.status,
    ownerId: c.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdateHospitalityBlueprintInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<UpdateHospitalityBlueprintInput & { id?: unknown; ownerId?: unknown; createdAt?: unknown }>;

  if (c.title !== undefined && typeof c.title !== "string") return null;
  if (c.description !== undefined && typeof c.description !== "string") return null;
  if (c.blueprintType !== undefined && !isValidBlueprintType(c.blueprintType)) return null;
  if (c.status !== undefined && !isValidStatus(c.status)) return null;
  if (c.features !== undefined && !isValidFeaturesArray(c.features)) return null;
  if (c.researchItemIds !== undefined && !isStringArray(c.researchItemIds)) return null;
  if (c.brandIds !== undefined && !isStringArray(c.brandIds)) return null;
  if (c.documentIds !== undefined && !isStringArray(c.documentIds)) return null;
  if (c.pdfTemplateIds !== undefined && !isStringArray(c.pdfTemplateIds)) return null;
  if (c.foodCostTarget !== undefined && c.foodCostTarget !== null && typeof c.foodCostTarget !== "number") return null;
  if (c.laborCostTarget !== undefined && c.laborCostTarget !== null && typeof c.laborCostTarget !== "number") return null;

  return {
    title: c.title,
    description: c.description,
    blueprintType: c.blueprintType,
    features: c.features,
    conceptNotes: c.conceptNotes,
    menuEngineering: c.menuEngineering,
    foodCostTarget: c.foodCostTarget,
    laborCostTarget: c.laborCostTarget,
    revenueStrategy: c.revenueStrategy,
    operationsFramework: c.operationsFramework,
    status: c.status,
    objectiveId: c.objectiveId,
    researchItemIds: c.researchItemIds,
    brandIds: c.brandIds,
    documentIds: c.documentIds,
    pdfTemplateIds: c.pdfTemplateIds,
  };
};

export const createChefDrewRouter = (
  options: ChefDrewRouterOptions = {},
): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", (_req, res) => {
    res.json(Array.from(blueprints.values()));
  });

  router.get("/:id", (req, res) => {
    const blueprint = blueprints.get(req.params.id);
    if (!blueprint) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }
    res.json(blueprint);
  });

  router.post("/", (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid blueprint payload" });
      return;
    }

    const createdAt = nowIso();
    const blueprint: HospitalityBlueprint = {
      id: blueprintId(),
      projectId: input.projectId,
      objectiveId: input.objectiveId ?? null,
      researchItemIds: input.researchItemIds ?? [],
      brandIds: input.brandIds ?? [],
      documentIds: input.documentIds ?? [],
      pdfTemplateIds: input.pdfTemplateIds ?? [],
      title: input.title,
      description: input.description ?? "",
      blueprintType: input.blueprintType,
      features: input.features ?? [],
      conceptNotes: input.conceptNotes ?? "",
      menuEngineering: input.menuEngineering ?? "",
      foodCostTarget: input.foodCostTarget ?? null,
      laborCostTarget: input.laborCostTarget ?? null,
      revenueStrategy: input.revenueStrategy ?? "",
      operationsFramework: input.operationsFramework ?? "",
      status: input.status ?? "draft",
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    blueprints.set(blueprint.id, blueprint);
    res.status(201).json(blueprint);
  });

  router.put("/:id", (req, res) => {
    const existing = blueprints.get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid blueprint payload" });
      return;
    }

    const updated: HospitalityBlueprint = {
      ...existing,
      updatedAt: nowIso(),
    };

    if (updates.title !== undefined) updated.title = updates.title;
    if (updates.description !== undefined) updated.description = updates.description;
    if (updates.blueprintType !== undefined) updated.blueprintType = updates.blueprintType;
    if (updates.features !== undefined) updated.features = updates.features;
    if (updates.conceptNotes !== undefined) updated.conceptNotes = updates.conceptNotes;
    if (updates.menuEngineering !== undefined) updated.menuEngineering = updates.menuEngineering;
    if (updates.foodCostTarget !== undefined) updated.foodCostTarget = updates.foodCostTarget;
    if (updates.laborCostTarget !== undefined) updated.laborCostTarget = updates.laborCostTarget;
    if (updates.revenueStrategy !== undefined) updated.revenueStrategy = updates.revenueStrategy;
    if (updates.operationsFramework !== undefined) updated.operationsFramework = updates.operationsFramework;
    if (updates.status !== undefined) updated.status = updates.status;
    if (updates.objectiveId !== undefined) updated.objectiveId = updates.objectiveId;
    if (updates.researchItemIds !== undefined) updated.researchItemIds = updates.researchItemIds;
    if (updates.brandIds !== undefined) updated.brandIds = updates.brandIds;
    if (updates.documentIds !== undefined) updated.documentIds = updates.documentIds;
    if (updates.pdfTemplateIds !== undefined) updated.pdfTemplateIds = updates.pdfTemplateIds;

    blueprints.set(updated.id, updated);
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const removed = blueprints.delete(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Blueprint not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
};

export default createChefDrewRouter;
