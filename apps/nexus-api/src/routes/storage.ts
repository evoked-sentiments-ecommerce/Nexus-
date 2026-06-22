import { Router, Request, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import {
  deleteFile,
  downloadFile,
  getSignedUrl,
  listFiles,
  uploadFile,
} from "../services/storageService";

const router = Router();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/", async (req: Request, res: Response) => {
  try {
    const prefix = typeof req.query.prefix === "string" ? req.query.prefix : "";
    const files = await listFiles(prefix);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/upload", async (req: Request, res: Response) => {
  try {
    const key = typeof req.body.key === "string" ? req.body.key : "";
    const content = typeof req.body.content === "string" ? req.body.content : "";
    if (!key) {
      res.status(400).json({ error: "File key is required" });
      return;
    }

    const buffer = req.body.encoding === "base64" ? Buffer.from(content, "base64") : Buffer.from(content);
    const file = await uploadFile(key, buffer, {
      contentType: typeof req.body.contentType === "string" ? req.body.contentType : undefined,
    });
    res.status(201).json({ file });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/download", async (req: Request, res: Response) => {
  try {
    const key = typeof req.body.key === "string" ? req.body.key : "";
    if (!key) {
      res.status(400).json({ error: "File key is required" });
      return;
    }

    const buffer = await downloadFile(key);
    res.json({ key, content: buffer.toString("base64"), encoding: "base64" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/signed-url", async (req: Request, res: Response) => {
  try {
    const key = typeof req.body.key === "string" ? req.body.key : "";
    if (!key) {
      res.status(400).json({ error: "File key is required" });
      return;
    }

    const expiresInSeconds = typeof req.body.expiresInSeconds === "number" ? req.body.expiresInSeconds : 3600;
    const url = await getSignedUrl(key, expiresInSeconds);
    res.json({ key, url, expiresInSeconds });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  try {
    const key = typeof req.body.key === "string" ? req.body.key : "";
    if (!key) {
      res.status(400).json({ error: "File key is required" });
      return;
    }

    await deleteFile(key);
    res.json({ success: true, key });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
