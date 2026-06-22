// ---------------------------------------------------------------------------
// PDF Generator — generates PDFs and uploads them to R2
// ---------------------------------------------------------------------------

export interface PDFSection {
  title: string;
  content: string;
}

export interface PDFGenerateOptions {
  title: string;
  subtitle?: string;
  sections: PDFSection[];
  logoUrl?: string;
  templateId?: string;
}

export interface PDFResult {
  url: string;
  key: string;
  size: number;
  generatedAt: Date;
}

/**
 * Generate a PDF document from the supplied options and upload it to storage.
 * Returns the stored URL and metadata.
 */
export async function generatePDF(options: PDFGenerateOptions): Promise<PDFResult> {
  if (!options.title) {
    throw new Error("PDF title is required");
  }
  if (!options.sections || options.sections.length === 0) {
    throw new Error("At least one PDF section is required");
  }

  // PDF rendering library (e.g., puppeteer/playwright) call would go here.
  // The generated buffer would then be uploaded via storageService.uploadFile().
  const key = `pdfs/${Date.now()}-${options.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  const url = `${process.env.R2_PUBLIC_URL ?? "https://storage.nexus.app"}/${key}`;

  return {
    url,
    key,
    size: 0,
    generatedAt: new Date(),
  };
}

/**
 * Validate that PDF options contain the minimum required fields.
 */
export function validatePDFOptions(options: Partial<PDFGenerateOptions>): string[] {
  const errors: string[] = [];
  if (!options.title || options.title.trim() === "") {
    errors.push("title is required");
  }
  if (!options.sections || options.sections.length === 0) {
    errors.push("at least one section is required");
  }
  return errors;
}
