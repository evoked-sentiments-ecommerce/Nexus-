"use strict";
// ---------------------------------------------------------------------------
// Design Intelligence — universal design engine.
// Generates logos, brand systems, packaging, labels, menus, recipe cards,
// training manuals, presentations, investor decks, marketing assets,
// UI systems, and print assets across multiple output formats.
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDesignSpec = generateDesignSpec;
exports.generateAsset = generateAsset;
exports.generateLogo = generateLogo;
exports.generateBrandSystem = generateBrandSystem;
exports.generateMenuDesign = generateMenuDesign;
exports.generatePresentation = generatePresentation;
exports.generateInvestorDeckDesign = generateInvestorDeckDesign;
exports.generateUISystem = generateUISystem;
const logger_1 = require("../logger");
// ---------------------------------------------------------------------------
// Design specification generation (stub — replace with design AI / Figma API)
// ---------------------------------------------------------------------------
async function generateDesignSpec(request) {
    (0, logger_1.logInfo)("design_intelligence_spec_generated", { assetType: request.assetType, brand: request.brandName });
    const layout = getDefaultLayout(request.assetType, request.dimensions);
    return {
        specId: `spec-${Date.now()}`,
        assetType: request.assetType,
        brandName: request.brandName,
        elements: buildElements(request),
        layout,
        typography: {
            headingFont: request.brandTokens.fontPrimary,
            bodyFont: request.brandTokens.fontSecondary,
            headingSize: 32,
            bodySize: 14,
            lineHeight: 1.5,
            letterSpacing: 0.02,
        },
        colourPalette: [
            { name: "Primary", hex: request.brandTokens.primaryColor, role: "primary" },
            { name: "Secondary", hex: request.brandTokens.secondaryColor, role: "secondary" },
            { name: "Accent", hex: request.brandTokens.accentColor, role: "accent" },
            { name: "Background", hex: "#FFFFFF", role: "background" },
            { name: "Text", hex: "#1A1A1A", role: "text" },
        ],
        exportSettings: request.outputFormats.map((fmt) => buildExportSetting(fmt, request.assetType)),
        generatedAt: new Date().toISOString(),
    };
}
// ---------------------------------------------------------------------------
// Asset generation (stub — replace with design rendering engine)
// ---------------------------------------------------------------------------
async function generateAsset(request) {
    (0, logger_1.logInfo)("design_intelligence_asset_generated", {
        requestId: request.requestId,
        assetType: request.assetType,
        formats: request.outputFormats,
    });
    const specification = await generateDesignSpec(request);
    const outputUrls = {};
    for (const fmt of request.outputFormats) {
        outputUrls[fmt] = `/assets/design/${request.requestId}/${request.assetType}.${fmt}`;
    }
    return {
        assetId: `asset-${Date.now()}`,
        requestId: request.requestId,
        assetType: request.assetType,
        brandName: request.brandName,
        specification,
        outputUrls,
        generatedAt: new Date().toISOString(),
    };
}
// ---------------------------------------------------------------------------
// Domain-specific convenience wrappers
// ---------------------------------------------------------------------------
async function generateLogo(brandName, tokens, formats = ["svg", "png"]) {
    return generateAsset({ requestId: `req-logo-${Date.now()}`, assetType: "logo", brandName, brandTokens: tokens, outputFormats: formats });
}
async function generateBrandSystem(brandName, tokens) {
    return generateAsset({ requestId: `req-brand-${Date.now()}`, assetType: "brand_system", brandName, brandTokens: tokens, outputFormats: ["pdf", "svg"] });
}
async function generateMenuDesign(brandName, tokens) {
    return generateAsset({ requestId: `req-menu-${Date.now()}`, assetType: "menu", brandName, brandTokens: tokens, outputFormats: ["pdf"] });
}
async function generatePresentation(brandName, tokens, slides = 10) {
    return generateAsset({ requestId: `req-pres-${Date.now()}`, assetType: "presentation", brandName, brandTokens: tokens, outputFormats: ["pptx", "pdf"], context: { slideCount: slides } });
}
async function generateInvestorDeckDesign(brandName, tokens) {
    return generateAsset({ requestId: `req-deck-${Date.now()}`, assetType: "investor_deck", brandName, brandTokens: tokens, outputFormats: ["pptx", "pdf"] });
}
async function generateUISystem(brandName, tokens) {
    return generateAsset({ requestId: `req-ui-${Date.now()}`, assetType: "ui_system", brandName, brandTokens: tokens, outputFormats: ["html", "svg"] });
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function getDefaultLayout(assetType, custom) {
    const defaults = {
        logo: { width: 800, height: 400, unit: "px", margins: { top: 40, right: 40, bottom: 40, left: 40 } },
        brand_system: { width: 1920, height: 1080, unit: "px", margins: { top: 80, right: 80, bottom: 80, left: 80 } },
        packaging: { width: 200, height: 300, unit: "mm", margins: { top: 5, right: 5, bottom: 5, left: 5 } },
        label: { width: 100, height: 60, unit: "mm", margins: { top: 3, right: 3, bottom: 3, left: 3 } },
        menu: { width: 210, height: 297, unit: "mm", margins: { top: 15, right: 15, bottom: 15, left: 15 } },
        recipe_card: { width: 148, height: 210, unit: "mm", margins: { top: 10, right: 10, bottom: 10, left: 10 } },
        training_manual: { width: 210, height: 297, unit: "mm", margins: { top: 25, right: 20, bottom: 25, left: 25 } },
        sop_layout: { width: 210, height: 297, unit: "mm", margins: { top: 25, right: 20, bottom: 25, left: 25 } },
        presentation: { width: 1920, height: 1080, unit: "px", margins: { top: 60, right: 80, bottom: 60, left: 80 } },
        investor_deck: { width: 1920, height: 1080, unit: "px", margins: { top: 60, right: 80, bottom: 60, left: 80 } },
        marketing_asset: { width: 1200, height: 628, unit: "px", margins: { top: 40, right: 40, bottom: 40, left: 40 } },
        website: { width: 1440, height: 900, unit: "px", margins: { top: 0, right: 0, bottom: 0, left: 0 } },
        ui_system: { width: 1440, height: 900, unit: "px", margins: { top: 0, right: 0, bottom: 0, left: 0 } },
        print_asset: { width: 210, height: 297, unit: "mm", margins: { top: 15, right: 15, bottom: 15, left: 15 } },
    };
    const layout = defaults[assetType] ?? defaults.print_asset;
    if (custom)
        return { ...layout, width: custom.width, height: custom.height };
    return layout;
}
function buildElements(request) {
    return [
        { elementId: `el-logo-${Date.now()}`, type: "logo", style: { fill: request.brandTokens.primaryColor }, position: { x: 60, y: 40 }, size: { width: 200, height: 80 }, layer: 1 },
        { elementId: `el-heading-${Date.now()}`, type: "text", content: request.brandName, style: { fontFamily: request.brandTokens.fontPrimary, fontSize: 32, color: "#1A1A1A", fontWeight: "bold" }, position: { x: 60, y: 140 }, size: { width: 600, height: 50 }, layer: 2 },
        { elementId: `el-tagline-${Date.now()}`, type: "text", content: request.brandTokens.tagline ?? "", style: { fontFamily: request.brandTokens.fontSecondary, fontSize: 16, color: "#666666" }, position: { x: 60, y: 200 }, size: { width: 500, height: 30 }, layer: 2 },
        { elementId: `el-accent-${Date.now()}`, type: "shape", style: { fill: request.brandTokens.accentColor, opacity: 0.1 }, position: { x: 0, y: 0 }, size: { width: 8, height: 300 }, layer: 0 },
    ];
}
function buildExportSetting(fmt, assetType) {
    const isPrint = ["pdf", "docx"].includes(fmt) || ["menu", "training_manual", "sop_layout", "recipe_card", "print_asset"].includes(assetType);
    return {
        format: fmt,
        resolution: fmt === "svg" ? undefined : isPrint ? 300 : 144,
        colourMode: isPrint ? "CMYK" : "RGB",
        bleed: isPrint ? 3 : undefined,
    };
}
//# sourceMappingURL=index.js.map