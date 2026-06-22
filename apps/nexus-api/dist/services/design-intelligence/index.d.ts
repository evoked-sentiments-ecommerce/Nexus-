export type DesignAssetType = "logo" | "brand_system" | "packaging" | "label" | "menu" | "recipe_card" | "training_manual" | "sop_layout" | "presentation" | "investor_deck" | "marketing_asset" | "website" | "ui_system" | "print_asset";
export type OutputFormat = "png" | "svg" | "pdf" | "pptx" | "docx" | "html";
export interface BrandTokens {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontPrimary: string;
    fontSecondary: string;
    logoUrl?: string;
    tagline?: string;
}
export interface DesignRequest {
    requestId: string;
    assetType: DesignAssetType;
    brandName: string;
    brandTokens: BrandTokens;
    outputFormats: OutputFormat[];
    dimensions?: {
        width: number;
        height: number;
    };
    copy?: Record<string, string>;
    context?: Record<string, unknown>;
    requestedBy?: string;
}
export interface DesignSpecification {
    specId: string;
    assetType: DesignAssetType;
    brandName: string;
    elements: DesignElement[];
    layout: LayoutSpec;
    typography: TypographySpec;
    colourPalette: ColourSpec[];
    exportSettings: ExportSetting[];
    generatedAt: string;
}
export interface DesignElement {
    elementId: string;
    type: "text" | "image" | "shape" | "icon" | "logo" | "divider";
    content?: string;
    style: Record<string, string | number>;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    layer: number;
}
export interface LayoutSpec {
    width: number;
    height: number;
    unit: "px" | "mm" | "in";
    grid?: {
        columns: number;
        gutter: number;
    };
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
export interface TypographySpec {
    headingFont: string;
    bodyFont: string;
    headingSize: number;
    bodySize: number;
    lineHeight: number;
    letterSpacing: number;
}
export interface ColourSpec {
    name: string;
    hex: string;
    role: "primary" | "secondary" | "accent" | "background" | "text" | "border";
}
export interface ExportSetting {
    format: OutputFormat;
    resolution?: number;
    colourMode?: "RGB" | "CMYK";
    bleed?: number;
}
export interface GeneratedAsset {
    assetId: string;
    requestId: string;
    assetType: DesignAssetType;
    brandName: string;
    specification: DesignSpecification;
    outputUrls: Partial<Record<OutputFormat, string>>;
    generatedAt: string;
}
export declare function generateDesignSpec(request: DesignRequest): Promise<DesignSpecification>;
export declare function generateAsset(request: DesignRequest): Promise<GeneratedAsset>;
export declare function generateLogo(brandName: string, tokens: BrandTokens, formats?: OutputFormat[]): Promise<GeneratedAsset>;
export declare function generateBrandSystem(brandName: string, tokens: BrandTokens): Promise<GeneratedAsset>;
export declare function generateMenuDesign(brandName: string, tokens: BrandTokens): Promise<GeneratedAsset>;
export declare function generatePresentation(brandName: string, tokens: BrandTokens, slides?: number): Promise<GeneratedAsset>;
export declare function generateInvestorDeckDesign(brandName: string, tokens: BrandTokens): Promise<GeneratedAsset>;
export declare function generateUISystem(brandName: string, tokens: BrandTokens): Promise<GeneratedAsset>;
//# sourceMappingURL=index.d.ts.map