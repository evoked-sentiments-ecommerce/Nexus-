export type PDFTemplateType =
  | "proposal"
  | "business_plan"
  | "brand_guide"
  | "sop"
  | "training_manual"
  | "recipe";

export type PDFGenerationStatus = "pending" | "generated" | "failed";

export type PDFExportControl =
  | "include_cover_page"
  | "include_toc"
  | "include_branding"
  | "optimize_for_print"
  | "enable_watermark";

export type PDFTemplate = {
  id: string;
  projectId: string;
  documentId: string;
  title: string;
  templateType: PDFTemplateType;
  status: PDFGenerationStatus;
  previewUrl: string | null;
  downloadUrl: string | null;
  exportControls: PDFExportControl[];
  createdAt: string;
  updatedAt: string;
};
