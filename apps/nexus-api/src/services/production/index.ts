// ---------------------------------------------------------------------------
// Production Engine — universal asset production service.
// Generates any production asset required to achieve an objective:
// PDF, DOCX, PPTX, XLSX, CSV, ZIP, HTML, JSON documents including
// costing sheets, financial models, training manuals, recipe cards,
// SOPs, marketing campaigns, presentations, hiring packages,
// and operational manuals.
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OutputFormat = "pdf" | "docx" | "pptx" | "xlsx" | "csv" | "zip" | "html" | "json";

export type AssetCategory =
  | "costing_sheet"
  | "financial_model"
  | "training_manual"
  | "recipe_card"
  | "recipe_book"
  | "sop_manual"
  | "marketing_campaign"
  | "presentation"
  | "hiring_package"
  | "operational_manual"
  | "business_plan"
  | "investor_deck"
  | "pitch_deck"
  | "research_report"
  | "blueprint"
  | "custom";

export interface ProductionRequest {
  requestId: string;
  category: AssetCategory;
  title: string;
  outputFormats: OutputFormat[];
  data: Record<string, unknown>;
  branding?: {
    companyName: string;
    primaryColor?: string;
    fontPrimary?: string;
    logoUrl?: string;
  };
  requestedBy?: string;
  projectId?: string;
}

export interface ProductionAsset {
  assetId: string;
  requestId: string;
  category: AssetCategory;
  title: string;
  outputUrls: Partial<Record<OutputFormat, string>>;
  sizeBytes?: number;
  pageCount?: number;
  generatedAt: string;
}

export interface ProductionManifest {
  manifestId: string;
  requestId: string;
  assets: ProductionAsset[];
  totalAssets: number;
  totalFormats: number;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Core production function
// ---------------------------------------------------------------------------

/**
 * Produce an asset from structured data.
 * Replace the stub with real rendering engines:
 *   PDF    → pdfGenerator service / Puppeteer / PDFKit
 *   DOCX   → docxtemplater / officegen
 *   PPTX   → pptxgenjs
 *   XLSX   → exceljs
 *   CSV    → papaparse / custom serialiser
 *   HTML   → template engine
 *   JSON   → JSON.stringify
 *   ZIP    → archiver
 */
export async function produce(request: ProductionRequest): Promise<ProductionManifest> {
  logInfo("production_started", {
    requestId: request.requestId,
    category: request.category,
    formats: request.outputFormats,
  });

  const assets: ProductionAsset[] = [];

  for (const fmt of request.outputFormats) {
    try {
      const asset = await renderAsset(request, fmt);
      assets.push(asset);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("production_render_error", { requestId: request.requestId, format: fmt, error: msg });
    }
  }

  const manifest: ProductionManifest = {
    manifestId: `manifest-${request.requestId}`,
    requestId: request.requestId,
    assets,
    totalAssets: assets.length,
    totalFormats: assets.length,
    generatedAt: new Date().toISOString(),
  };

  logInfo("production_completed", {
    requestId: request.requestId,
    assetCount: assets.length,
  });

  return manifest;
}

// ---------------------------------------------------------------------------
// Domain-specific convenience functions
// ---------------------------------------------------------------------------

export async function produceCostingSheet(
  title: string,
  data: Record<string, unknown>,
  projectId?: string
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-costing-${Date.now()}`,
    category: "costing_sheet",
    title,
    outputFormats: ["xlsx", "pdf"],
    data,
    projectId,
  });
}

export async function produceFinancialModel(
  title: string,
  data: Record<string, unknown>,
  projectId?: string
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-fm-${Date.now()}`,
    category: "financial_model",
    title,
    outputFormats: ["xlsx", "pdf"],
    data,
    projectId,
  });
}

export async function produceTrainingManual(
  title: string,
  data: Record<string, unknown>,
  projectId?: string
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-training-${Date.now()}`,
    category: "training_manual",
    title,
    outputFormats: ["pdf", "docx"],
    data,
    projectId,
  });
}

export async function produceRecipeCard(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-recipe-card-${Date.now()}`,
    category: "recipe_card",
    title,
    outputFormats: ["pdf"],
    data,
  });
}

export async function produceRecipeBook(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-recipe-book-${Date.now()}`,
    category: "recipe_book",
    title,
    outputFormats: ["pdf", "docx"],
    data,
  });
}

export async function produceSOPManual(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-sop-${Date.now()}`,
    category: "sop_manual",
    title,
    outputFormats: ["pdf", "docx"],
    data,
  });
}

export async function producePresentation(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-pres-${Date.now()}`,
    category: "presentation",
    title,
    outputFormats: ["pptx", "pdf"],
    data,
  });
}

export async function produceInvestorDeck(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-investor-${Date.now()}`,
    category: "investor_deck",
    title,
    outputFormats: ["pptx", "pdf"],
    data,
  });
}

export async function produceHiringPackage(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-hiring-${Date.now()}`,
    category: "hiring_package",
    title,
    outputFormats: ["pdf", "docx"],
    data,
  });
}

export async function produceOperationalManual(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-ops-${Date.now()}`,
    category: "operational_manual",
    title,
    outputFormats: ["pdf", "docx"],
    data,
  });
}

export async function produceMarketingCampaign(
  title: string,
  data: Record<string, unknown>
): Promise<ProductionManifest> {
  return produce({
    requestId: `req-mkt-${Date.now()}`,
    category: "marketing_campaign",
    title,
    outputFormats: ["pdf", "html", "json"],
    data,
  });
}

// ---------------------------------------------------------------------------
// Internal rendering stub
// ---------------------------------------------------------------------------

async function renderAsset(request: ProductionRequest, format: OutputFormat): Promise<ProductionAsset> {
  // Stub — replace with real rendering engine per format:
  //   pdf   → pdfGenerator.ts
  //   docx  → docxtemplater
  //   pptx  → pptxgenjs
  //   xlsx  → exceljs
  //   csv   → serialize data rows
  //   html  → template engine
  //   json  → JSON.stringify(data)
  //   zip   → archiver

  const slug = request.title.toLowerCase().replace(/\s+/g, "-");
  const outputUrl = `/production/${request.requestId}/${slug}.${format}`;

  return {
    assetId: `asset-${request.requestId}-${format}-${Date.now()}`,
    requestId: request.requestId,
    category: request.category,
    title: request.title,
    outputUrls: { [format]: outputUrl },
    sizeBytes: 0,  // real value set after rendering
    pageCount: format === "pdf" || format === "docx" ? estimatePageCount(request.category) : undefined,
    generatedAt: new Date().toISOString(),
  };
}

function estimatePageCount(category: AssetCategory): number {
  const estimates: Partial<Record<AssetCategory, number>> = {
    costing_sheet: 2,
    financial_model: 5,
    training_manual: 40,
    recipe_card: 1,
    recipe_book: 60,
    sop_manual: 30,
    marketing_campaign: 10,
    presentation: 20,
    investor_deck: 15,
    pitch_deck: 12,
    hiring_package: 8,
    operational_manual: 50,
    business_plan: 25,
    research_report: 15,
    blueprint: 20,
  };
  return estimates[category] ?? 5;
}
