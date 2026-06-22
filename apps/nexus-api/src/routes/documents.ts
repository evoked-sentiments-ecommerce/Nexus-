import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { DocumentRepository } from "../database/repositories";
import {
  type CreateDocumentInput,
  type Document,
  type DocumentStatus,
  type DocumentType,
  type UpdateDocumentInput,
} from "../entities/Document";

type DocumentsRouterOptions = {
  requireAuth?: RequestHandler;
};

const documentRepository = new DocumentRepository();

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "proposal",
  "business_plan",
  "strategy",
  "sop",
  "training_manual",
  "marketing_plan",
  "brand_guide",
  "recipe",
  "report",
  "contract",
];

const VALID_STATUSES: DocumentStatus[] = ["draft", "published", "archived"];

const isValidDocumentType = (value: unknown): value is DocumentType =>
  typeof value === "string" &&
  VALID_DOCUMENT_TYPES.includes(value as DocumentType);

const isValidStatus = (value: unknown): value is DocumentStatus =>
  typeof value === "string" && VALID_STATUSES.includes(value as DocumentStatus);

const isValidVersion = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const nowIso = () => new Date().toISOString();
const documentId = () => `doc_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateDocumentInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<CreateDocumentInput>;

  if (!c.projectId || typeof c.projectId !== "string") return null;
  if (!c.title || typeof c.title !== "string") return null;
  if (!c.ownerId || typeof c.ownerId !== "string") return null;
  if (!c.documentType || !isValidDocumentType(c.documentType)) return null;

  if (
    c.objectiveId !== undefined &&
    c.objectiveId !== null &&
    typeof c.objectiveId !== "string"
  ) {
    return null;
  }

  if (c.brandId !== undefined && c.brandId !== null && typeof c.brandId !== "string") {
    return null;
  }

  if (c.content !== undefined && typeof c.content !== "string") return null;
  if (c.status !== undefined && !isValidStatus(c.status)) return null;
  if (c.version !== undefined && !isValidVersion(c.version)) return null;
  if (c.tags !== undefined && !isStringArray(c.tags)) return null;

  return {
    projectId: c.projectId,
    objectiveId: c.objectiveId,
    brandId: c.brandId,
    title: c.title,
    documentType: c.documentType,
    content: c.content,
    status: c.status,
    version: c.version,
    tags: c.tags,
    ownerId: c.ownerId,
  };
};

const toUpdateInput = (body: unknown): UpdateDocumentInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<
    UpdateDocumentInput & {
      id?: unknown;
      projectId?: unknown;
      objectiveId?: unknown;
      brandId?: unknown;
      ownerId?: unknown;
      createdAt?: unknown;
    }
  >;

  if (c.title !== undefined && typeof c.title !== "string") return null;
  if (c.documentType !== undefined && !isValidDocumentType(c.documentType)) {
    return null;
  }
  if (c.content !== undefined && typeof c.content !== "string") return null;
  if (c.status !== undefined && !isValidStatus(c.status)) return null;
  if (c.version !== undefined && !isValidVersion(c.version)) return null;
  if (c.tags !== undefined && !isStringArray(c.tags)) return null;

  return {
    title: c.title,
    documentType: c.documentType,
    content: c.content,
    status: c.status,
    version: c.version,
    tags: c.tags,
  };
};

export const createDocumentsRouter = (
  options: DocumentsRouterOptions = {},
): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", async (_req, res) => {
    try {
      const documents = await documentRepository.findAll();
      res.json(documents);
    } catch {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  router.get("/:id", async (req, res) => {
    let document: Document | null = null;
    try {
      document = await documentRepository.findById(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to fetch document" });
      return;
    }

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json(document);
  });

  router.post("/", async (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid document payload" });
      return;
    }

    const createdAt = nowIso();
    const document: Document = {
      id: documentId(),
      projectId: input.projectId,
      objectiveId: input.objectiveId ?? null,
      brandId: input.brandId ?? null,
      title: input.title,
      documentType: input.documentType,
      content: input.content ?? "",
      status: input.status ?? "draft",
      version: input.version ?? 1,
      tags: input.tags ?? [],
      ownerId: input.ownerId,
      createdAt,
      updatedAt: createdAt,
    };

    try {
      const created = await documentRepository.create(document);
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  router.put("/:id", async (req, res) => {
    let existing: Document | null = null;
    try {
      existing = await documentRepository.findById(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to fetch document" });
      return;
    }

    if (!existing) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid document payload" });
      return;
    }

    const updated: Document = {
      ...existing,
      updatedAt: nowIso(),
    };

    if (updates.title !== undefined) updated.title = updates.title;
    if (updates.documentType !== undefined) updated.documentType = updates.documentType;
    if (updates.content !== undefined) updated.content = updates.content;
    if (updates.status !== undefined) updated.status = updates.status;
    if (updates.tags !== undefined) updated.tags = updates.tags;

    const hasContentChange =
      updates.title !== undefined ||
      updates.documentType !== undefined ||
      updates.content !== undefined ||
      updates.tags !== undefined;

    if (updates.version !== undefined) {
      updated.version = updates.version;
    } else if (hasContentChange) {
      updated.version = existing.version + 1;
    }

    try {
      const persisted = await documentRepository.update(updated);
      if (!persisted) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      res.json(persisted);
    } catch {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  router.delete("/:id", async (req, res) => {
    let removed = false;
    try {
      removed = await documentRepository.delete(req.params.id);
    } catch {
      res.status(500).json({ error: "Failed to delete document" });
      return;
    }

    if (!removed) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createDocumentsRouter;
