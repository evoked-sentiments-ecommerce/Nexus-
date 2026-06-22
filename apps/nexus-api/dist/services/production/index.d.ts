export type OutputFormat = "pdf" | "docx" | "pptx" | "xlsx" | "csv" | "zip" | "html" | "json";
export type AssetCategory = "costing_sheet" | "financial_model" | "training_manual" | "recipe_card" | "recipe_book" | "sop_manual" | "marketing_campaign" | "presentation" | "hiring_package" | "operational_manual" | "business_plan" | "investor_deck" | "pitch_deck" | "research_report" | "blueprint" | "custom";
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
export declare function produce(request: ProductionRequest): Promise<ProductionManifest>;
export declare function produceCostingSheet(title: string, data: Record<string, unknown>, projectId?: string): Promise<ProductionManifest>;
export declare function produceFinancialModel(title: string, data: Record<string, unknown>, projectId?: string): Promise<ProductionManifest>;
export declare function produceTrainingManual(title: string, data: Record<string, unknown>, projectId?: string): Promise<ProductionManifest>;
export declare function produceRecipeCard(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function produceRecipeBook(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function produceSOPManual(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function producePresentation(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function produceInvestorDeck(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function produceHiringPackage(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function produceOperationalManual(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
export declare function produceMarketingCampaign(title: string, data: Record<string, unknown>): Promise<ProductionManifest>;
//# sourceMappingURL=index.d.ts.map