/**
 * pdf.test.ts
 *
 * Unit + Integration tests for the PDF Generator service.
 */

import {
  generatePDF,
  validatePDFOptions,
  PDFGenerateOptions,
  PDFResult,
  PDFSection,
} from "../src/services/pdfGenerator";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validSection: PDFSection = {
  title: "Executive Summary",
  content: "This blueprint outlines the operational plan for our concept.",
};

const validOptions: PDFGenerateOptions = {
  title: "Q1 Hospitality Blueprint",
  subtitle: "Chef Drew Engine Output",
  sections: [validSection],
};

// ---------------------------------------------------------------------------
// Unit tests — validatePDFOptions
// ---------------------------------------------------------------------------

describe("validatePDFOptions — unit tests", () => {
  it("returns no errors for a valid options object", () => {
    const errors = validatePDFOptions(validOptions);
    expect(errors).toHaveLength(0);
  });

  it("returns an error when title is missing", () => {
    const errors = validatePDFOptions({ sections: [validSection] });
    expect(errors).toContain("title is required");
  });

  it("returns an error when title is an empty string", () => {
    const errors = validatePDFOptions({ title: "   ", sections: [validSection] });
    expect(errors).toContain("title is required");
  });

  it("returns an error when sections is empty", () => {
    const errors = validatePDFOptions({ title: "My PDF", sections: [] });
    expect(errors).toContain("at least one section is required");
  });

  it("returns an error when sections is not provided", () => {
    const errors = validatePDFOptions({ title: "My PDF" });
    expect(errors).toContain("at least one section is required");
  });

  it("returns multiple errors when both title and sections are missing", () => {
    const errors = validatePDFOptions({});
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it("returns no errors when multiple sections are provided", () => {
    const errors = validatePDFOptions({
      title: "Multi-section PDF",
      sections: [
        { title: "Intro", content: "Introduction content." },
        { title: "Operations", content: "Operational details." },
        { title: "Menu", content: "Menu curation details." },
      ],
    });
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — generatePDF
// ---------------------------------------------------------------------------

describe("generatePDF — unit tests", () => {
  beforeEach(() => {
    process.env.R2_PUBLIC_URL = "https://storage.nexus.app";
  });

  afterEach(() => {
    delete process.env.R2_PUBLIC_URL;
  });

  it("returns a PDFResult with a URL, key, size, and generatedAt", async () => {
    const result: PDFResult = await generatePDF(validOptions);

    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(0);
    expect(typeof result.key).toBe("string");
    expect(result.key).toMatch(/\.pdf$/);
    expect(typeof result.size).toBe("number");
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it("uses the R2_PUBLIC_URL env variable in the result URL", async () => {
    const result = await generatePDF(validOptions);
    expect(result.url).toContain("https://storage.nexus.app");
  });

  it("falls back to default storage URL when R2_PUBLIC_URL is not set", async () => {
    delete process.env.R2_PUBLIC_URL;
    const result = await generatePDF(validOptions);
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(0);
  });

  it("includes a sanitised version of the title in the storage key", async () => {
    const result = await generatePDF({
      title: "My Hospitality Blueprint",
      sections: [validSection],
    });
    expect(result.key).toContain("my-hospitality-blueprint");
  });

  it("throws when title is missing", async () => {
    await expect(
      generatePDF({ title: "", sections: [validSection] })
    ).rejects.toThrow("PDF title is required");
  });

  it("throws when sections array is empty", async () => {
    await expect(
      generatePDF({ title: "Valid Title", sections: [] })
    ).rejects.toThrow("At least one PDF section is required");
  });

  it("sets generatedAt close to the current time", async () => {
    const before = Date.now();
    const result = await generatePDF(validOptions);
    const after = Date.now();

    const generated = result.generatedAt.getTime();
    expect(generated).toBeGreaterThanOrEqual(before);
    expect(generated).toBeLessThanOrEqual(after + 5);
  });
});

// ---------------------------------------------------------------------------
// Integration tests — PDF generation with multiple sections
// ---------------------------------------------------------------------------

describe("generatePDF — integration tests", () => {
  beforeEach(() => {
    process.env.R2_PUBLIC_URL = "https://storage.nexus.app";
  });

  afterEach(() => {
    delete process.env.R2_PUBLIC_URL;
  });

  it("handles a full blueprint PDF with multiple sections", async () => {
    const options: PDFGenerateOptions = {
      title: "Nexus Full Blueprint",
      subtitle: "Generated by Chef Drew",
      logoUrl: "https://nexus.app/logo.png",
      sections: [
        { title: "Concept Overview", content: "A modern casual dining concept." },
        { title: "Menu Strategy", content: "Seasonal farm-to-table ingredients." },
        { title: "Staffing Model", content: "Lean team of 12 FOH and 8 BOH." },
        { title: "Financial Projections", content: "Break-even at month 9." },
      ],
    };

    const result = await generatePDF(options);

    expect(result.url).toContain("https://storage.nexus.app");
    expect(result.key).toContain("nexus-full-blueprint");
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it("produces unique keys for successive PDF generations", async () => {
    const result1 = await generatePDF(validOptions);
    // Small delay to ensure timestamps differ
    await new Promise((r) => setTimeout(r, 2));
    const result2 = await generatePDF(validOptions);

    expect(result1.key).not.toBe(result2.key);
  });

  it("validates before generating — rejects invalid options", async () => {
    const invalidOptions: PDFGenerateOptions = {
      title: "",
      sections: [],
    };

    const errors = validatePDFOptions(invalidOptions);
    expect(errors.length).toBeGreaterThan(0);

    await expect(generatePDF(invalidOptions)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Type-level tests — PDFSection interface
// ---------------------------------------------------------------------------

describe("PDFSection type contract", () => {
  it("has required title and content fields", () => {
    const section: PDFSection = {
      title: "Introduction",
      content: "Welcome to Nexus.",
    };
    expect(section.title).toBe("Introduction");
    expect(section.content).toBe("Welcome to Nexus.");
  });
});
