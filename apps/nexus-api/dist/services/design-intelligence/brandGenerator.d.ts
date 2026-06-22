export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    background: string;
}
export interface Typography {
    headingFont: string;
    bodyFont: string;
    displayFont: string;
    scale: Record<string, string>;
}
export interface LogoBrief {
    description: string;
    style: string;
    mood: string;
    colors: string[];
}
export interface BrandVoice {
    tone: string;
    personality: string[];
    messagingPillars: string[];
    examplePhrases: string[];
}
export interface BrandSystem {
    brandId: string;
    name: string;
    industry: string;
    colorPalette: ColorPalette;
    typography: Typography;
    logoBrief: LogoBrief;
    brandVoice: BrandVoice;
    generatedAt: string;
}
export interface BrandContext {
    name: string;
    industry: string;
    description?: string;
    targetAudience?: string;
    competitors?: string[];
    values?: string[];
}
export declare function generateBrandSystem(context: BrandContext): Promise<BrandSystem>;
export declare function generateBrandGuide(brandSystem: BrandSystem): Promise<{
    url: string;
    key: string;
}>;
//# sourceMappingURL=brandGenerator.d.ts.map