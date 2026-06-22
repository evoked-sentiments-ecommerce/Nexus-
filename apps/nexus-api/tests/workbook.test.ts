/**
 * workbook.test.ts
 * Tests for workbook generator.
 */

jest.mock(
  "exceljs",
  () => ({
    Workbook: jest.fn().mockImplementation(() => ({
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
        getRow: jest.fn().mockReturnValue({ font: {}, fill: {} }),
      }),
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(Buffer.from("mock-excel-data")),
      },
    })),
  }),
  { virtual: true }
);

describe("Workbook Generator", () => {
  const mockMenuItem = {
    itemId: "1",
    name: "Chicken Burger",
    category: "Mains",
    description: "Classic burger",
    sellingPrice: 18,
    foodCost: 5.4,
    foodCostPct: 30,
    contribution: 12.6,
    menuCategory: "star" as const,
    allergens: [],
    dietaryTags: [],
  };

  describe("generateFinancialModel", () => {
    it("should return buffer and filename", async () => {
      const { generateFinancialModel } = require("../src/services/production/workbookGenerator");
      const result = await generateFinancialModel({ revenue: 50000 });
      expect(result).toHaveProperty("buffer");
      expect(result).toHaveProperty("filename");
      expect(result.filename).toMatch(/\.xlsx$/);
      expect(result.buffer).toBeDefined();
    });
  });

  describe("generateFoodCostSheet", () => {
    it("should return buffer and filename for menu items", async () => {
      const { generateFoodCostSheet } = require("../src/services/production/workbookGenerator");
      const result = await generateFoodCostSheet([mockMenuItem]);
      expect(result).toHaveProperty("buffer");
      expect(result).toHaveProperty("filename");
      expect(result.filename).toMatch(/food-cost.*\.xlsx$/);
    });

    it("should handle empty items array", async () => {
      const { generateFoodCostSheet } = require("../src/services/production/workbookGenerator");
      const result = await generateFoodCostSheet([]);
      expect(result.buffer).toBeDefined();
    });
  });

  describe("generateLaborPlanSheet", () => {
    it("should generate a labor plan workbook", async () => {
      const { generateLaborPlanSheet } = require("../src/services/production/workbookGenerator");
      const schedule = [
        { role: "Head Chef", hoursPerWeek: 50, hourlyRate: 35, headcount: 1 },
        { role: "Sous Chef", hoursPerWeek: 45, hourlyRate: 25, headcount: 1 },
      ];
      const result = await generateLaborPlanSheet(schedule);
      expect(result.buffer).toBeDefined();
      expect(result.filename).toMatch(/labor-plan.*\.xlsx$/);
    });
  });

  describe("generateBudgetTemplate", () => {
    it("should generate a budget template", async () => {
      const { generateBudgetTemplate } = require("../src/services/production/workbookGenerator");
      const result = await generateBudgetTemplate({ year: 2024 });
      expect(result.buffer).toBeDefined();
      expect(result.filename).toMatch(/budget.*\.xlsx$/);
    });
  });
});

describe("Package Builder", () => {
  describe("buildPackage", () => {
    it("should build a package and return metadata", async () => {
      const { buildPackage } = require("../src/services/production/packageBuilder");
      const assets = [
        { name: "report.pdf", type: "pdf", size: 1024, url: "https://example.com/report.pdf" },
        { name: "data.xlsx", type: "xlsx", size: 2048 },
      ];
      const result = await buildPackage("pkg-123", assets);
      expect(result.packageId).toBe("pkg-123");
      expect(result.assetCount).toBe(2);
      expect(result.status).toBe("ready");
      expect(result.manifestUrl).toBeDefined();
    });
  });

  describe("listPackageAssets", () => {
    it("should return null for unknown package", () => {
      const { listPackageAssets } = require("../src/services/production/packageBuilder");
      expect(listPackageAssets("unknown-package-id")).toBeNull();
    });

    it("should return manifest after building", async () => {
      const { buildPackage, listPackageAssets } = require("../src/services/production/packageBuilder");
      await buildPackage("pkg-list-test", [{ name: "file.pdf", type: "pdf", size: 512 }]);
      const manifest = listPackageAssets("pkg-list-test");
      expect(manifest).toBeDefined();
      expect(manifest?.packageId).toBe("pkg-list-test");
    });
  });
});
