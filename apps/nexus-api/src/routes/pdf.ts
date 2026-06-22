import { Router, type RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import {
  type CreatePDFTemplateInput,
  type PDFExportControl,
  type PDFGenerationStatus,
  type PDFTemplate,
  type PDFTemplateType,
  type UpdatePDFTemplateInput,
} from "../entities/PDFTemplate";
import { generateAndStorePDF } from "../services/pdfGenerator";

type PDFRouterOptions = {
  requireAuth?: RequestHandler;
};

const pdfTemplates = new Map<string, PDFTemplate>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

const VALID_TEMPLATE_TYPES: PDFTemplateType[] = [
  "proposal",
  "business_plan",
  "brand_guide",
  "sop",
  "training_manual",
  "recipe",
];

const VALID_STATUSES: PDFGenerationStatus[] = ["pending", "generated", "failed"];

const VALID_EXPORT_CONTROLS: PDFExportControl[] = [
  "include_cover_page",
  "include_toc",
  "include_branding",
  "optimize_for_print",
  "enable_watermark",
];

const isTemplateType = (value: unknown): value is PDFTemplateType =>
  typeof value === "string" && VALID_TEMPLATE_TYPES.includes(value as PDFTemplateType);

const isStatus = (value: unknown): value is PDFGenerationStatus =>
  typeof value === "string" && VALID_STATUSES.includes(value as PDFGenerationStatus);

const isExportControlArray = (value: unknown): value is PDFExportControl[] =>
  Array.isArray(value) &&
  value.every(
    (control) =>
      typeof control === "string" &&
      VALID_EXPORT_CONTROLS.includes(control as PDFExportControl),
  );

const isOptionalNullableString = (value: unknown): value is string | null | undefined =>
  value === undefined || value === null || typeof value === "string";

const toCreateInput = (body: unknown): CreatePDFTemplateInput | null => {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Partial<CreatePDFTemplateInput>;

  if (!candidate.projectId || typeof candidate.projectId !== "string") return null;
  if (!candidate.documentId || typeof candidate.documentId !== "string") return null;
  if (!candidate.title || typeof candidate.title !== "string") return null;
  if (!candidate.templateType || !isTemplateType(candidate.templateType)) return null;
  if (
    candidate.exportControls !== undefined &&
    !isExportControlArray(candidate.exportControls)
  ) {
    return null;
  }

  return {
    projectId: candidate.projectId,
    documentId: candidate.documentId,
    title: candidate.title,
    templateType: candidate.templateType,
    exportControls: candidate.exportControls,
  };
};

const toUpdateInput = (body: unknown): UpdatePDFTemplateInput | null => {
  if (!body || typeof body !== "object") return null;

  const candidate = body as Partial<
    UpdatePDFTemplateInput & {
      id?: unknown;
      projectId?: unknown;
      documentId?: unknown;
      createdAt?: unknown;
    }
  >;

  if (candidate.title !== undefined && typeof candidate.title !== "string") return null;
  if (candidate.templateType !== undefined && !isTemplateType(candidate.templateType)) {
    return null;
  }
  if (candidate.status !== undefined && !isStatus(candidate.status)) return null;
  if (!isOptionalNullableString(candidate.previewUrl)) return null;
  if (!isOptionalNullableString(candidate.downloadUrl)) return null;
  if (
    candidate.exportControls !== undefined &&
    !isExportControlArray(candidate.exportControls)
  ) {
    return null;
  }

  return {
    title: candidate.title,
    templateType: candidate.templateType,
    status: candidate.status,
    previewUrl: candidate.previewUrl,
    downloadUrl: candidate.downloadUrl,
    exportControls: candidate.exportControls,
  };
};

const nowIso = () => new Date().toISOString();
const pdfId = () => `pdf_${randomUUID()}`;

export const createPDFRouter = (options: PDFRouterOptions = {}): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/", (_req, res) => {
    res.json(Array.from(pdfTemplates.values()));
  });

  router.get("/:id", (req, res) => {
    const template = pdfTemplates.get(req.params.id);
    if (!template) {
      res.status(404).json({ error: "PDF template not found" });
      return;
    }

    res.json(template);
  });

  router.post("/", (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid PDF payload" });
      return;
    }

    const createdAt = nowIso();
    const template: PDFTemplate = {
      id: pdfId(),
      projectId: input.projectId,
      documentId: input.documentId,
      title: input.title,
      templateType: input.templateType,
      status: "generated",
      previewUrl: `/api/pdf/preview/${input.documentId}`,
      downloadUrl: `/api/pdf/download/${input.documentId}`,
      exportControls: input.exportControls ?? [
        "include_cover_page",
        "include_toc",
        "include_branding",
      ],
      createdAt,
      updatedAt: createdAt,
    };

    pdfTemplates.set(template.id, template);
    res.status(201).json(template);
  });

  router.post("/generate", async (req, res) => {
    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid PDF generation payload" });
      return;
    }

    try {
      const generatedFile = await generateAndStorePDF({
        projectId: input.projectId,
        documentId: input.documentId,
        title: input.title,
        templateType: input.templateType,
      });

      const createdAt = nowIso();
      const generatedPDF: PDFTemplate = {
        id: pdfId(),
        projectId: input.projectId,
        documentId: input.documentId,
        title: input.title,
        templateType: input.templateType,
        status: "generated",
        previewUrl: generatedFile.downloadUrl,
        downloadUrl: generatedFile.downloadUrl,
        exportControls: input.exportControls ?? [
          "include_cover_page",
          "include_toc",
          "optimize_for_print",
        ],
        createdAt,
        updatedAt: createdAt,
      };

      pdfTemplates.set(generatedPDF.id, generatedPDF);
      res.status(201).json(generatedPDF);
    } catch (error) {
      const message = error instanceof Error ? error.message : "PDF generation failed";
      if (message.includes("Missing required environment variable")) {
        res.status(500).json({ error: "PDF generation is not configured" });
        return;
      }

      res.status(500).json({ error: "PDF generation failed" });
    }
  });

  router.put("/:id", (req, res) => {
    const existing = pdfTemplates.get(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "PDF template not found" });
      return;
    }

    const updates = toUpdateInput(req.body);
    if (!updates) {
      res.status(400).json({ error: "Invalid PDF payload" });
      return;
    }

    const updated: PDFTemplate = {
      ...existing,
      updatedAt: nowIso(),
    };

    if (updates.title !== undefined) updated.title = updates.title;
    if (updates.templateType !== undefined) updated.templateType = updates.templateType;
    if (updates.status !== undefined) updated.status = updates.status;
    if (updates.previewUrl !== undefined) updated.previewUrl = updates.previewUrl;
    if (updates.downloadUrl !== undefined) updated.downloadUrl = updates.downloadUrl;
    if (updates.exportControls !== undefined) {
      updated.exportControls = updates.exportControls;
    }

    pdfTemplates.set(updated.id, updated);
    res.json(updated);
  });

  router.get("/:id/preview", (req, res) => {
    const template = pdfTemplates.get(req.params.id);
    if (!template) {
      res.status(404).json({ error: "PDF template not found" });
      return;
    }

    res.json({
      id: template.id,
      projectId: template.projectId,
      documentId: template.documentId,
      title: template.title,
      templateType: template.templateType,
      previewUrl: template.previewUrl,
      status: template.status,
    });
  });

  router.get("/:id/download", (req, res) => {
    const template = pdfTemplates.get(req.params.id);
    if (!template) {
      res.status(404).json({ error: "PDF template not found" });
      return;
    }

    res.json({
      id: template.id,
      title: template.title,
      templateType: template.templateType,
      downloadUrl: template.downloadUrl,
      exportControls: template.exportControls,
    });
  });

  router.put("/:id/export-controls", (req, res) => {
    const template = pdfTemplates.get(req.params.id);
    if (!template) {
      res.status(404).json({ error: "PDF template not found" });
      return;
    }

    const controls =
      req.body && typeof req.body === "object"
        ? (req.body as { exportControls?: unknown }).exportControls
        : undefined;

    if (!isExportControlArray(controls)) {
      res.status(400).json({ error: "Invalid export controls payload" });
      return;
    }

    const updated: PDFTemplate = {
      ...template,
      exportControls: controls,
      updatedAt: nowIso(),
    };

    pdfTemplates.set(updated.id, updated);
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const removed = pdfTemplates.delete(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "PDF template not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};

export default createPDFRouter;
