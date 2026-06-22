// ---------------------------------------------------------------------------
// Brand Generator — LLM-driven brand system generation
// ---------------------------------------------------------------------------

import { logInfo, logError } from "../logger";
import { structuredOutput } from "../llm";
import { generatePDF } from "../pdfGenerator";

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

export async function generateBrandSystem(context: BrandContext): Promise<BrandSystem> {
  logInfo("brand_system_generating", { name: context.name, industry: context.industry });

  const schema = `{
    "colorPalette": {"primary": "hex", "secondary": "hex", "accent": "hex", "neutral": "hex", "background": "hex"},
    "typography": {"headingFont": "string", "bodyFont": "string", "displayFont": "string", "scale": {}},
    "logoBrief": {"description": "string", "style": "string", "mood": "string", "colors": ["string"]},
    "brandVoice": {"tone": "string", "personality": ["string"], "messagingPillars": ["string"], "examplePhrases": ["string"]}
  }`;

  const prompt = `Generate a complete brand system for "${context.name}" in the ${context.industry} industry.
${context.description ? `Description: ${context.description}` : ""}
${context.targetAudience ? `Target audience: ${context.targetAudience}` : ""}
${context.values?.length ? `Core values: ${context.values.join(", ")}` : ""}
Create a cohesive brand with color palette (hex values), typography, logo brief, and brand voice.`;

  const result = await structuredOutput<{
    colorPalette: ColorPalette;
    typography: Typography;
    logoBrief: LogoBrief;
    brandVoice: BrandVoice;
  }>([{ role: "user", content: prompt }], schema);

  const brandSystem: BrandSystem = {
    brandId: `brand-${Date.now()}`,
    name: context.name,
    industry: context.industry,
    colorPalette: result.colorPalette ?? { primary: "#1A1A2E", secondary: "#16213E", accent: "#E94560", neutral: "#F5F5F5", background: "#FFFFFF" },
    typography: result.typography ?? { headingFont: "Inter", bodyFont: "Open Sans", displayFont: "Playfair Display", scale: {} },
    logoBrief: result.logoBrief ?? { description: `Minimal ${context.industry} logo`, style: "modern", mood: "professional", colors: ["#1A1A2E"] },
    brandVoice: result.brandVoice ?? { tone: "Professional and approachable", personality: ["Innovative", "Trustworthy", "Bold"], messagingPillars: ["Quality", "Innovation", "Service"], examplePhrases: [`${context.name} — Excellence in ${context.industry}`] },
    generatedAt: new Date().toISOString(),
  };

  logInfo("brand_system_generated", { brandId: brandSystem.brandId, name: context.name });
  return brandSystem;
}

export async function generateBrandGuide(brandSystem: BrandSystem): Promise<{ url: string; key: string }> {
  logInfo("brand_guide_generating", { brandId: brandSystem.brandId });

  try {
    const result = await generatePDF({
      title: `${brandSystem.name} — Brand Guidelines`,
      subtitle: brandSystem.industry,
      sections: [
        { title: "Color Palette", content: JSON.stringify(brandSystem.colorPalette, null, 2) },
        { title: "Typography", content: `Heading: ${brandSystem.typography.headingFont}
Body: ${brandSystem.typography.bodyFont}
Display: ${brandSystem.typography.displayFont}` },
        { title: "Logo Brief", content: `${brandSystem.logoBrief.description}
Style: ${brandSystem.logoBrief.style}
Mood: ${brandSystem.logoBrief.mood}` },
        { title: "Brand Voice", content: `Tone: ${brandSystem.brandVoice.tone}
Personality: ${brandSystem.brandVoice.personality.join(", ")}
Pillars: ${brandSystem.brandVoice.messagingPillars.join(", ")}` },
      ],
    });
    return { url: result.url, key: result.key };
  } catch (err) {
    logError("brand_guide_error", { message: err instanceof Error ? err.message : String(err) });
    return { url: "", key: "" };
  }
}
