"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const storageService_1 = require("../services/storageService");
const router = (0, express_1.Router)();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/", async (req, res) => {
    try {
        const prefix = typeof req.query.prefix === "string" ? req.query.prefix : "";
        const files = await (0, storageService_1.listFiles)(prefix);
        res.json({ files });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/upload", async (req, res) => {
    try {
        const key = typeof req.body.key === "string" ? req.body.key : "";
        const content = typeof req.body.content === "string" ? req.body.content : "";
        if (!key) {
            res.status(400).json({ error: "File key is required" });
            return;
        }
        const buffer = req.body.encoding === "base64" ? Buffer.from(content, "base64") : Buffer.from(content);
        const file = await (0, storageService_1.uploadFile)(key, buffer, {
            contentType: typeof req.body.contentType === "string" ? req.body.contentType : undefined,
        });
        res.status(201).json({ file });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/download", async (req, res) => {
    try {
        const key = typeof req.body.key === "string" ? req.body.key : "";
        if (!key) {
            res.status(400).json({ error: "File key is required" });
            return;
        }
        const buffer = await (0, storageService_1.downloadFile)(key);
        res.json({ key, content: buffer.toString("base64"), encoding: "base64" });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/signed-url", async (req, res) => {
    try {
        const key = typeof req.body.key === "string" ? req.body.key : "";
        if (!key) {
            res.status(400).json({ error: "File key is required" });
            return;
        }
        const expiresInSeconds = typeof req.body.expiresInSeconds === "number" ? req.body.expiresInSeconds : 3600;
        const url = await (0, storageService_1.getSignedUrl)(key, expiresInSeconds);
        res.json({ key, url, expiresInSeconds });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.delete("/", async (req, res) => {
    try {
        const key = typeof req.body.key === "string" ? req.body.key : "";
        if (!key) {
            res.status(400).json({ error: "File key is required" });
            return;
        }
        await (0, storageService_1.deleteFile)(key);
        res.json({ success: true, key });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=storage.js.map