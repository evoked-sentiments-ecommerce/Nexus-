"use strict";
// ---------------------------------------------------------------------------
// PDF Generator — generates PDFs and uploads them to R2
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
exports.validatePDFOptions = validatePDFOptions;
/**
 * Generate a PDF document from the supplied options and upload it to storage.
 * Returns the stored URL and metadata.
 */
async function generatePDF(options) {
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
function validatePDFOptions(options) {
    const errors = [];
    if (!options.title || options.title.trim() === "") {
        errors.push("title is required");
    }
    if (!options.sections || options.sections.length === 0) {
        errors.push("at least one section is required");
    }
    return errors;
}
//# sourceMappingURL=pdfGenerator.js.map