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
export declare function generatePDF(options: PDFGenerateOptions): Promise<PDFResult>;
/**
 * Validate that PDF options contain the minimum required fields.
 */
export declare function validatePDFOptions(options: Partial<PDFGenerateOptions>): string[];
//# sourceMappingURL=pdfGenerator.d.ts.map