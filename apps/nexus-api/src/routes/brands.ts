import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import {
  type Brand,
  type BrandStatus,
  type ColorSwatch,
  type CreateBrandInput,
  type TypographySpec,
  type UpdateBrandInput,
} from "../entities/Brand";

type BrandsRouterOptions = {
  requireAuth?: RequestHandler;
};

const brands = new Map<string, Brand>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

const VALID_STATUSES: BrandStatus[] = [
  "draft",
  "in_review",
  "approved",
  "active",
  "archived",
];

const isValidStatus = (status: unknown): status is BrandStatus =>
  typeof status === "string" &&
  VALID_STATUSES.includes(status as BrandStatus);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const isColorSwatchArray = (value: unknown): value is ColorSwatch[] => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (v) =>
      v !== null &&
      typeof v === "object" &&
      typeof (v as Record<string, unknown>).name === "string" &&
      typeof (v as Record<string, unknown>).hex === "string",
  );
};

const isTypographySpecArray = (value: unknown): value is TypographySpec[] => {
  if (!Array.isArray(value)) return false;
  return value.every(
    (v) =>
      v !== null &&
      typeof v === "object" &&
      typeof (v as Record<string, unknown>).role === "string" &&
      typeof (v as Record<string, unknown>).family === "string",
  );
};

const nowIso = () => new Date().toISOString();
const brandId = () => `brd_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateBrandInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<CreateBrandInput>;

  if (!c.projectId || typeof c.projectId !== "string") return null;
  if (!c.name || typeof c.name !== "string") return null;
  if (!c.ownerId || typeof c.ownerId !== "string") return null;

  if (
    c.objectiveId !== undefined &&
    c.objectiveId !== null &&
    typeof c.objectiveId !== "string"
  )
    return null;

  if (c.status !== undefined && !isValidStatus(c.status)) return null;

  for (const key of [
    "tagline",
    "mission",
    "vision",
    "positioning",
    "targetAudience",
    "brandVoice",
  ] as const) {
    if (c[key] !== undefined && typeof c[key] !== "string") return null;
  }

  if (c.researchItemIds !== undefined && !isStringArray(c.researchItemIds))
    return null;
  if (c.personality !== undefined && !isStringArray(c.personality)) return null;
  if (c.coreValues !== undefined && !isStringArray(c.coreValues)) return null;
  if (c.colorPalette !== undefined && !isColorSwatchArray(c.colorPalette))
    return null;
  if (c.typography !== undefined && !isTypographySpecArray(c.typography))
    return null;

  return {
    projectId: c.projectId,
    objectiveId: c.objectiveId,
    researchItemIds: c.researchItemIds,
    name: c.name,
    tagline: c.tagline,
    mission: c.mission,
    vision: c.vision,
    positioning: c.positioning,
    targetAudience: c.targetAudience,
    brandVoice: c.brandVoice,
    personality: c.personality,
    coreValues: c.coreValues,
    colorPalette: c.colorPalette,
    typography: c.typography,
    status: c.status,
    ownerId: c.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdateBrandInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<
    UpdateBrandInput & {
      id?: unknown;
      projectId?: unknown;
      objectiveId?: unknown;
      ownerId?: unknown;
      createdAt?: unknown;
    }
  >;

  if (c.name !== undefined && typeof c.name !== "string") return null;
  if (c.status !== undefined && !isValidStatus(c.status)) return null;

  for (const key of [
    "tagline",
    "mission",
    "vision",
    "positioning",
    "targetAudience",
    "brandVoice",
  ] as const) {
    if (c[key] !== undefined && typeof c[key] !== "string") return null;
  }

  if (c.researchItemIds !== undefined && !isStringArray(c.researchItemIds))
    return null;
  if (c.personality !== undefined && !isStringArray(c.personality)) return null;
  if (c.coreValues !== undefined && !isStringArray(c.coreValues)) return null;
  if (c.colorPalette !== undefined && !isColorSwatchArray(c.colorPalette))
    return null;
  if (c.typography !== undefined && !isTypographySpecArray(c.typography))
    return null;

  return {
    name: c.name,
    tagline: c.tagline,
    mission: c.mission,
    vision: c.vision,
    positioning: c.positioning,
    targetAudience: c.targetAudience,
    brandVoice: c.brandVoice,
    personality: c.personality,
    coreValues: c.coreValues,
    colorPalette: c.colorPalette,
    typography: c.typography,
    status: c.status,
    researchItemIds: c.researchItemIds,
  };
};

export const createBrandsRouter = (
  options: BrandsRouterOptions = {},
): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", (_req, res) => {
    res.json(Array.from(brands.values()));
  });

  router.get("/:id", (req, res) => {
    const brand = brands.get(req.params.id);
    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    res.json(brand);
  });

  router.post("/", (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid brand payload" });
      return;
    }

    const createdAt = nowIso();
    const brand: Brand = {
      id: brandId(),
      projectId: input.projectId,
      objectiveId: input.objectiveId ?? null,
      researchItemIds: input.researchItemIds ?? [],
      name: input.name,
      tagline: input.tagline ?? "",
      mission: input.mission ?? "",
      vision: input.vision ?? "",
      positioning: input.positioning ?? "",
      targetAudience: input.targetAudience ?? "",
      brandVoice: input.brandVoice ?? "",
      personality: input.personality ?? [],
      coreValues: input.coreValues ?? [],
      colorPalette: input.colorPalette ?? [],
      typography: input.typography ?? [],
      status: input.status ?? "draft",
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    brands.set(brand.id, brand);
    res.status(201).json(brand);
  });

  router.put("/:id", (req, res) => {
    const existing = brands.get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid brand payload" });
      return;
    }

    const updated: Brand = { ...existing, updatedAt: nowIso() };

    if (updates.name !== undefined) updated.name = updates.name;
    if (updates.tagline !== undefined) updated.tagline = updates.tagline;
    if (updates.mission !== undefined) updated.mission = updates.mission;
    if (updates.vision !== undefined) updated.vision = updates.vision;
    if (updates.positioning !== undefined)
      updated.positioning = updates.positioning;
    if (updates.targetAudience !== undefined)
      updated.targetAudience = updates.targetAudience;
    if (updates.brandVoice !== undefined) updated.brandVoice = updates.brandVoice;
    if (updates.personality !== undefined)
      updated.personality = updates.personality;
    if (updates.coreValues !== undefined) updated.coreValues = updates.coreValues;
    if (updates.colorPalette !== undefined)
      updated.colorPalette = updates.colorPalette;
    if (updates.typography !== undefined) updated.typography = updates.typography;
    if (updates.status !== undefined) updated.status = updates.status;
    if (updates.researchItemIds !== undefined)
      updated.researchItemIds = updates.researchItemIds;

    brands.set(updated.id, updated);
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const removed = brands.delete(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
};

export default createBrandsRouter;
