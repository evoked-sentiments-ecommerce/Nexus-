import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import {
  type CreatePackageInput,
  type Package,
  type PackageStatus,
  type PackageType,
  type UpdatePackageInput,
} from "../entities/Package";
import {
  PackageAssetNotFoundError,
  generateAndStorePackage,
} from "../services/packageGenerator";

type PackagesRouterOptions = {
  requireAuth?: RequestHandler;
};

const packages = new Map<string, Package>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

const VALID_PACKAGE_TYPES: PackageType[] = [
  "startup",
  "brand",
  "operations",
  "training",
  "hospitality_blueprint",
  "executive",
];

const VALID_STATUSES: PackageStatus[] = ["draft", "assembling", "ready", "archived"];

const isPackageType = (value: unknown): value is PackageType =>
  typeof value === "string" && VALID_PACKAGE_TYPES.includes(value as PackageType);

const isStatus = (value: unknown): value is PackageStatus =>
  typeof value === "string" && VALID_STATUSES.includes(value as PackageStatus);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const isOptionalNullableString = (value: unknown): value is string | null | undefined =>
  value === undefined || value === null || typeof value === "string";

const nowIso = () => new Date().toISOString();
const packageId = () => `pkg_${randomUUID()}`;

const toCreateInput = (body: unknown): CreatePackageInput | null => {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Partial<CreatePackageInput>;

  if (!candidate.projectId || typeof candidate.projectId !== "string") return null;
  if (!candidate.packageName || typeof candidate.packageName !== "string") return null;
  if (!candidate.packageType || !isPackageType(candidate.packageType)) return null;
  if (!candidate.ownerId || typeof candidate.ownerId !== "string") return null;

  if (
    candidate.objectiveId !== undefined &&
    candidate.objectiveId !== null &&
    typeof candidate.objectiveId !== "string"
  ) {
    return null;
  }

  if (candidate.includedDocuments !== undefined && !isStringArray(candidate.includedDocuments)) {
    return null;
  }
  if (candidate.includedPDFs !== undefined && !isStringArray(candidate.includedPDFs)) {
    return null;
  }
  if (candidate.includedAssets !== undefined && !isStringArray(candidate.includedAssets)) {
    return null;
  }
  if (candidate.status !== undefined && !isStatus(candidate.status)) return null;

  return {
    projectId: candidate.projectId,
    objectiveId: candidate.objectiveId,
    packageName: candidate.packageName,
    packageType: candidate.packageType,
    includedDocuments: candidate.includedDocuments,
    includedPDFs: candidate.includedPDFs,
    includedAssets: candidate.includedAssets,
    status: candidate.status,
    ownerId: candidate.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdatePackageInput | null => {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Partial<
    UpdatePackageInput & {
      id?: unknown;
      projectId?: unknown;
      objectiveId?: unknown;
      ownerId?: unknown;
      createdAt?: unknown;
    }
  >;

  if (candidate.packageName !== undefined && typeof candidate.packageName !== "string") {
    return null;
  }
  if (candidate.packageType !== undefined && !isPackageType(candidate.packageType)) {
    return null;
  }
  if (candidate.status !== undefined && !isStatus(candidate.status)) return null;
  if (candidate.includedDocuments !== undefined && !isStringArray(candidate.includedDocuments)) {
    return null;
  }
  if (candidate.includedPDFs !== undefined && !isStringArray(candidate.includedPDFs)) {
    return null;
  }
  if (candidate.includedAssets !== undefined && !isStringArray(candidate.includedAssets)) {
    return null;
  }
  if (!isOptionalNullableString(candidate.downloadUrl)) return null;

  return {
    packageName: candidate.packageName,
    packageType: candidate.packageType,
    includedDocuments: candidate.includedDocuments,
    includedPDFs: candidate.includedPDFs,
    includedAssets: candidate.includedAssets,
    status: candidate.status,
    downloadUrl: candidate.downloadUrl,
  };
};

export const createPackagesRouter = (options: PackagesRouterOptions = {}): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", (_req, res) => {
    res.json(Array.from(packages.values()));
  });

  router.get("/:id", (req, res) => {
    const pkg = packages.get(req.params.id);
    if (!pkg) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    res.json(pkg);
  });

  router.post("/", (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid package payload" });
      return;
    }

    const createdAt = nowIso();
    const pkg: Package = {
      id: packageId(),
      projectId: input.projectId,
      objectiveId: input.objectiveId ?? null,
      packageName: input.packageName,
      packageType: input.packageType,
      includedDocuments: input.includedDocuments ?? [],
      includedPDFs: input.includedPDFs ?? [],
      includedAssets: input.includedAssets ?? [],
      status: input.status ?? "draft",
      downloadUrl: null,
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    packages.set(pkg.id, pkg);
    res.status(201).json(pkg);
  });

  router.put("/:id", (req, res) => {
    const existing = packages.get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid package payload" });
      return;
    }

    const updated: Package = {
      ...existing,
      updatedAt: nowIso(),
    };

    if (updates.packageName !== undefined) updated.packageName = updates.packageName;
    if (updates.packageType !== undefined) updated.packageType = updates.packageType;
    if (updates.includedDocuments !== undefined) {
      updated.includedDocuments = updates.includedDocuments;
    }
    if (updates.includedPDFs !== undefined) updated.includedPDFs = updates.includedPDFs;
    if (updates.includedAssets !== undefined) updated.includedAssets = updates.includedAssets;
    if (updates.status !== undefined) updated.status = updates.status;
    if (updates.downloadUrl !== undefined) updated.downloadUrl = updates.downloadUrl;

    packages.set(updated.id, updated);
    res.json(updated);
  });

  router.post("/:id/generate", async (req, res) => {
    const existing = packages.get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    try {
      const generated = await generateAndStorePackage({
        packageId: existing.id,
        projectId: existing.projectId,
        packageName: existing.packageName,
        includedDocuments: existing.includedDocuments,
        includedPDFs: existing.includedPDFs,
        includedAssets: existing.includedAssets,
      });

      const updated: Package = {
        ...existing,
        status: "ready",
        downloadUrl: generated.packageUrl,
        updatedAt: nowIso(),
      };

      packages.set(updated.id, updated);
      res.status(201).json({
        packageUrl: generated.packageUrl,
        assetManifest: generated.assetManifest,
      });
    } catch (error) {
      if (error instanceof PackageAssetNotFoundError) {
        res.status(404).json({
          error: `Unable to resolve ${error.assetType} asset '${error.assetId}' from storage`,
        });
        return;
      }

      const message = error instanceof Error ? error.message : "Package generation failed";
      if (message.includes("Missing required environment variable")) {
        res.status(500).json({ error: "Package generation is not configured" });
        return;
      }

      res.status(500).json({ error: "Package generation failed" });
    }
  });

  router.delete("/:id", (req, res) => {
    const removed = packages.delete(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createPackagesRouter;
