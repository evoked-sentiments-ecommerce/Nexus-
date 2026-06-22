"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const pdfGenerator_1 = require("../services/pdfGenerator");
const router = (0, express_1.Router)();
router.use((req, res, next) => (0, auth_1.authenticateToken)(req, res, next));
router.get("/templates", async (_req, res) => {
    try {
        res.json({
            templates: [
                { id: "blueprint", name: "Blueprint", description: "Operational blueprint layout" },
                { id: "proposal", name: "Proposal", description: "Client proposal template" },
                { id: "report", name: "Report", description: "Multi-section report template" },
            ],
        });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/generate", async (req, res) => {
    try {
        const errors = (0, pdfGenerator_1.validatePDFOptions)(req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const result = await (0, pdfGenerator_1.generatePDF)({
            title: req.body.title,
            subtitle: typeof req.body.subtitle === "string" ? req.body.subtitle : undefined,
            sections: req.body.sections,
            logoUrl: typeof req.body.logoUrl === "string" ? req.body.logoUrl : undefined,
            templateId: typeof req.body.templateId === "string" ? req.body.templateId : undefined,
        });
        res.status(201).json({ pdf: result });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=pdf.js.map