"use strict";
// ---------------------------------------------------------------------------
// Brand Generator — LLM-driven brand system generation
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBrandSystem = generateBrandSystem;
exports.generateBrandGuide = generateBrandGuide;
const logger_1 = require("../logger");
const llm_1 = require("../llm");
const pdfGenerator_1 = require("../pdfGenerator");
async function generateBrandSystem(context) {
    (0, logger_1.logInfo)("brand_system_generating", { name: context.name, industry: context.industry });
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
    const result = await (0, llm_1.structuredOutput)([{ role: "user", content: prompt }], schema);
    const brandSystem = {
        brandId: `brand-${Date.now()}`,
        name: context.name,
        industry: context.industry,
        colorPalette: result.colorPalette ?? { primary: "#1A1A2E", secondary: "#16213E", accent: "#E94560", neutral: "#F5F5F5", background: "#FFFFFF" },
        typography: result.typography ?? { headingFont: "Inter", bodyFont: "Open Sans", displayFont: "Playfair Display", scale: {} },
        logoBrief: result.logoBrief ?? { description: `Minimal ${context.industry} logo`, style: "modern", mood: "professional", colors: ["#1A1A2E"] },
        brandVoice: result.brandVoice ?? { tone: "Professional and approachable", personality: ["Innovative", "Trustworthy", "Bold"], messagingPillars: ["Quality", "Innovation", "Service"], examplePhrases: [`${context.name} — Excellence in ${context.industry}`] },
        generatedAt: new Date().toISOString(),
    };
    (0, logger_1.logInfo)("brand_system_generated", { brandId: brandSystem.brandId, name: context.name });
    return brandSystem;
}
async function generateBrandGuide(brandSystem) {
    (0, logger_1.logInfo)("brand_guide_generating", { brandId: brandSystem.brandId });
    try {
        const result = await (0, pdfGenerator_1.generatePDF)({
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
    }
    catch (err) {
        (0, logger_1.logError)("brand_guide_error", { message: err instanceof Error ? err.message : String(err) });
        return { url: "", key: "" };
    }
}
//# sourceMappingURL=brandGenerator.js.map