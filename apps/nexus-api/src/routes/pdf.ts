import { Router, Request, Response } from "express";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { generatePDF, validatePDFOptions } from "../services/pdfGenerator";

const router = Router();

router.use((req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next));

router.get("/templates", async (_req: Request, res: Response) => {
  try {
    res.json({
      templates: [
        { id: "blueprint", name: "Blueprint", description: "Operational blueprint layout" },
        { id: "proposal", name: "Proposal", description: "Client proposal template" },
        { id: "report", name: "Report", description: "Multi-section report template" },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const errors = validatePDFOptions(req.body);
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    const result = await generatePDF({
      title: req.body.title,
      subtitle: typeof req.body.subtitle === "string" ? req.body.subtitle : undefined,
      sections: req.body.sections,
      logoUrl: typeof req.body.logoUrl === "string" ? req.body.logoUrl : undefined,
      templateId: typeof req.body.templateId === "string" ? req.body.templateId : undefined,
    });

    res.status(201).json({ pdf: result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
