"use strict";
// ---------------------------------------------------------------------------
// Production Engine — universal asset production service.
// Generates any production asset required to achieve an objective:
// PDF, DOCX, PPTX, XLSX, CSV, ZIP, HTML, JSON documents including
// costing sheets, financial models, training manuals, recipe cards,
// SOPs, marketing campaigns, presentations, hiring packages,
// and operational manuals.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.produce = produce;
exports.produceCostingSheet = produceCostingSheet;
exports.produceFinancialModel = produceFinancialModel;
exports.produceTrainingManual = produceTrainingManual;
exports.produceRecipeCard = produceRecipeCard;
exports.produceRecipeBook = produceRecipeBook;
exports.produceSOPManual = produceSOPManual;
exports.producePresentation = producePresentation;
exports.produceInvestorDeck = produceInvestorDeck;
exports.produceHiringPackage = produceHiringPackage;
exports.produceOperationalManual = produceOperationalManual;
exports.produceMarketingCampaign = produceMarketingCampaign;
const logger_1 = require("../logger");
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
async function produce(request) {
    (0, logger_1.logInfo)("production_started", {
        requestId: request.requestId,
        category: request.category,
        formats: request.outputFormats,
    });
    const assets = [];
    for (const fmt of request.outputFormats) {
        try {
            const asset = await renderAsset(request, fmt);
            assets.push(asset);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            (0, logger_1.logError)("production_render_error", { requestId: request.requestId, format: fmt, error: msg });
        }
    }
    const manifest = {
        manifestId: `manifest-${request.requestId}`,
        requestId: request.requestId,
        assets,
        totalAssets: assets.length,
        totalFormats: assets.length,
        generatedAt: new Date().toISOString(),
    };
    (0, logger_1.logInfo)("production_completed", {
        requestId: request.requestId,
        assetCount: assets.length,
    });
    return manifest;
}
// ---------------------------------------------------------------------------
// Domain-specific convenience functions
// ---------------------------------------------------------------------------
async function produceCostingSheet(title, data, projectId) {
    return produce({
        requestId: `req-costing-${Date.now()}`,
        category: "costing_sheet",
        title,
        outputFormats: ["xlsx", "pdf"],
        data,
        projectId,
    });
}
async function produceFinancialModel(title, data, projectId) {
    return produce({
        requestId: `req-fm-${Date.now()}`,
        category: "financial_model",
        title,
        outputFormats: ["xlsx", "pdf"],
        data,
        projectId,
    });
}
async function produceTrainingManual(title, data, projectId) {
    return produce({
        requestId: `req-training-${Date.now()}`,
        category: "training_manual",
        title,
        outputFormats: ["pdf", "docx"],
        data,
        projectId,
    });
}
async function produceRecipeCard(title, data) {
    return produce({
        requestId: `req-recipe-card-${Date.now()}`,
        category: "recipe_card",
        title,
        outputFormats: ["pdf"],
        data,
    });
}
async function produceRecipeBook(title, data) {
    return produce({
        requestId: `req-recipe-book-${Date.now()}`,
        category: "recipe_book",
        title,
        outputFormats: ["pdf", "docx"],
        data,
    });
}
async function produceSOPManual(title, data) {
    return produce({
        requestId: `req-sop-${Date.now()}`,
        category: "sop_manual",
        title,
        outputFormats: ["pdf", "docx"],
        data,
    });
}
async function producePresentation(title, data) {
    return produce({
        requestId: `req-pres-${Date.now()}`,
        category: "presentation",
        title,
        outputFormats: ["pptx", "pdf"],
        data,
    });
}
async function produceInvestorDeck(title, data) {
    return produce({
        requestId: `req-investor-${Date.now()}`,
        category: "investor_deck",
        title,
        outputFormats: ["pptx", "pdf"],
        data,
    });
}
async function produceHiringPackage(title, data) {
    return produce({
        requestId: `req-hiring-${Date.now()}`,
        category: "hiring_package",
        title,
        outputFormats: ["pdf", "docx"],
        data,
    });
}
async function produceOperationalManual(title, data) {
    return produce({
        requestId: `req-ops-${Date.now()}`,
        category: "operational_manual",
        title,
        outputFormats: ["pdf", "docx"],
        data,
    });
}
async function produceMarketingCampaign(title, data) {
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
async function renderAsset(request, format) {
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
        sizeBytes: 0, // real value set after rendering
        pageCount: format === "pdf" || format === "docx" ? estimatePageCount(request.category) : undefined,
        generatedAt: new Date().toISOString(),
    };
}
function estimatePageCount(category) {
    const estimates = {
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
//# sourceMappingURL=index.js.map