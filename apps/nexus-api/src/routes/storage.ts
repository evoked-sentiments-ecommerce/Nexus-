import { basename } from "node:path";
import { Router, type RequestHandler, type Response } from "express";
import {
  deleteFile,
  downloadFile,
  generateSignedUrl,
  listFiles,
  uploadFile,
} from "../services/storageService";

type StorageRouterOptions = {
  requireAuth?: RequestHandler;
};

type UploadBody = {
  key?: string;
  fileName?: string;
  contentType?: string;
  data: string;
};

const toUploadBody = (body: unknown): UploadBody | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const input = body as Partial<UploadBody>;

  if (typeof input.data !== "string" || !input.data.trim()) {
    return null;
  }

  if (input.key !== undefined && typeof input.key !== "string") {
    return null;
  }

  if (input.fileName !== undefined && typeof input.fileName !== "string") {
    return null;
  }

  if (!input.key && !input.fileName) {
    return null;
  }

  if (input.contentType !== undefined && typeof input.contentType !== "string") {
    return null;
  }

  return {
    key: input.key,
    fileName: input.fileName,
    contentType: input.contentType,
    data: input.data,
  };
};

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const toLimit = (value: unknown): number | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toExpiresIn = (value: unknown): number => {
  if (value === undefined) {
    return 900;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid expiresIn query parameter");
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid expiresIn query parameter");
  }

  return parsed;
};

const resolveErrorStatus = (message: string): number => {
  if (
    message.includes("Unsupported asset type") ||
    message.includes("Invalid") ||
    message.includes("cannot be empty")
  ) {
    return 400;
  }

  if (message.includes("not found") || message.includes("NoSuchKey")) {
    return 404;
  }

  if (message.includes("Missing required environment variable")) {
    return 500;
  }

  return 500;
};

const handleStorageError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : "Storage request failed";
  const status = resolveErrorStatus(message);

  res.status(status).json({ error: status >= 500 ? "Storage request failed" : message });
};

export const createStorageRouter = (options: StorageRouterOptions = {}): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", async (req, res) => {
    try {
      const prefix = toOptionalString(req.query.prefix);
      const limit = toLimit(req.query.limit);

      const output = await listFiles(prefix, limit ?? 100);
      res.json(output);
    } catch (error) {
      handleStorageError(error, res);
    }
  });

  router.post("/upload", async (req, res) => {
    try {
      const input = toUploadBody(req.body);
      if (!input) {
        res.status(400).json({ error: "Invalid upload payload" });
        return;
      }

      const key = input.key ?? input.fileName ?? "";
      const fileName = input.fileName ?? key;
      const data = Buffer.from(input.data, "base64");

      if (data.length === 0) {
        res.status(400).json({ error: "Invalid upload payload: data must be base64" });
        return;
      }

      const uploaded = await uploadFile({
        key,
        fileName,
        data,
        contentType: input.contentType,
      });

      res.status(201).json(uploaded);
    } catch (error) {
      handleStorageError(error, res);
    }
  });

  router.get("/download/:key", async (req, res) => {
    try {
      const key = decodeURIComponent(req.params.key);
      const file = await downloadFile(key);
      const fileName = basename(file.key);

      res.setHeader("Content-Type", file.contentType);
      res.setHeader("Content-Length", file.contentLength.toString());
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
      res.send(file.data);
    } catch (error) {
      handleStorageError(error, res);
    }
  });

  router.delete("/:key", async (req, res) => {
    try {
      const key = decodeURIComponent(req.params.key);
      await deleteFile(key);
      res.status(204).send();
    } catch (error) {
      handleStorageError(error, res);
    }
  });

  router.get("/signed-url/:key", async (req, res) => {
    try {
      const key = decodeURIComponent(req.params.key);
      const expiresIn = toExpiresIn(req.query.expiresIn);
      const result = await generateSignedUrl(key, expiresIn);
      res.json(result);
    } catch (error) {
      handleStorageError(error, res);
    }
  });

  return router;
};

export default createStorageRouter;
