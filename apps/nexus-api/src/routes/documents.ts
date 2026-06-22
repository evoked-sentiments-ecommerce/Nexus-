import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { env } from "../config/env";
import { DocumentRecord, DocumentRepository } from "../database/repositories";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const documentRepository = new DocumentRepository();
const memoryDocuments = new Map<string, DocumentRecord>();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;
    const documents = env.DATABASE_URL
      ? await documentRepository.list(projectId)
      : Array.from(memoryDocuments.values()).filter(
          (document) => !projectId || document.projectId === projectId
        );
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const type = typeof req.body.type === "string" ? req.body.type : "note";
    if (!title) {
      res.status(400).json({ error: "Document title is required" });
      return;
    }

    const document: DocumentRecord = {
      id: randomUUID(),
      projectId: typeof req.body.projectId === "string" ? req.body.projectId : null,
      objectiveId: typeof req.body.objectiveId === "string" ? req.body.objectiveId : null,
      brandId: typeof req.body.brandId === "string" ? req.body.brandId : null,
      title,
      type,
      status: typeof req.body.status === "string" ? req.body.status : "draft",
      content: typeof req.body.content === "string" ? req.body.content : "",
      storageKey: typeof req.body.storageKey === "string" ? req.body.storageKey : null,
      storageUrl: typeof req.body.storageUrl === "string" ? req.body.storageUrl : null,
      metadata:
        req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL ? await documentRepository.create(document) : null;
    const result = persisted ?? document;
    if (!persisted && !env.DATABASE_URL) {
      memoryDocuments.set(result.id, result);
    }

    res.status(201).json({ document: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const document = env.DATABASE_URL
      ? await documentRepository.getById(req.params.id)
      : memoryDocuments.get(req.params.id) ?? null;

    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json({ document });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const existing = env.DATABASE_URL
      ? await documentRepository.getById(req.params.id)
      : memoryDocuments.get(req.params.id) ?? null;

    if (!existing) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    const updateInput = {
      title: typeof req.body.title === "string" ? req.body.title : undefined,
      type: typeof req.body.type === "string" ? req.body.type : undefined,
      status: typeof req.body.status === "string" ? req.body.status : undefined,
      content: typeof req.body.content === "string" ? req.body.content : undefined,
      storageKey: typeof req.body.storageKey === "string" ? req.body.storageKey : req.body.storageKey === null ? null : undefined,
      storageUrl: typeof req.body.storageUrl === "string" ? req.body.storageUrl : req.body.storageUrl === null ? null : undefined,
      metadata: req.body.metadata && typeof req.body.metadata === "object" ? req.body.metadata : undefined,
    };

    const updated = env.DATABASE_URL
      ? await documentRepository.update(req.params.id, updateInput)
      : {
          ...existing,
          ...updateInput,
          metadata: updateInput.metadata ?? existing.metadata,
          updatedAt: new Date().toISOString(),
        };

    if (!updated) {
      res.status(500).json({ error: "Unable to update document" });
      return;
    }

    if (!env.DATABASE_URL) {
      memoryDocuments.set(updated.id, updated);
    }

    res.json({ document: updated });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = env.DATABASE_URL
      ? await documentRepository.delete(req.params.id)
      : memoryDocuments.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
