/**
 * chef-drew.test.ts
 * Tests for Chef Drew services.
 */

jest.mock("../src/services/llm", () => ({
  completeChat: jest.fn().mockResolvedValue("Mock LLM response"),
  structuredOutput: jest.fn().mockResolvedValue({}),
  streamCompletion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/services/pdfGenerator", () => ({
  generatePDF: jest.fn().mockResolvedValue({
    url: "https://example.com/test.pdf",
    key: "test.pdf",
    size: 1024,
    generatedAt: new Date(),
  }),
  validatePDFOptions: jest.fn().mockReturnValue([]),
}));

jest.mock("../src/services/agents", () => ({
  runAgent: jest.fn().mockResolvedValue({
    taskId: "task-1",
    status: "completed",
    output: { summary: "Test output" },
  }),
  createCollaborationSession: jest.fn().mockReturnValue({ sessionId: "session-1", status: "planning" }),
  executeCollaborationSession: jest.fn().mockResolvedValue({ status: "completed", results: [] }),
  recommendAgentsForObjective: jest.fn().mockReturnValue([]),
}));

jest.mock("../src/database/connection", () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getPool: jest.fn().mockReturnValue(null),
}));

describe("menuEngineer", () => {
  const { engineerMenu } = require("../src/services/chef-drew/menuEngineer");

  const mockContext = {
    operationName: "The Test Restaurant",
    domain: "restaurant" as const,
    cuisineStyle: "Contemporary",
    coversPerDay: 100,
    avgSpend: 45,
  };

  const mockItems = [
    { itemId: "1", name: "Burger", category: "Mains", description: "Classic burger", sellingPrice: 18, foodCost: 5.4, foodCostPct: 30, contribution: 12.6, menuCategory: "star" as const, allergens: [], dietaryTags: [] },
    { itemId: "2", name: "Salad", category: "Starters", description: "Garden salad", sellingPrice: 12, foodCost: 5.0, foodCostPct: 42, contribution: 7, menuCategory: "dog" as const, allergens: [], dietaryTags: ["vegan"] },
    { itemId: "3", name: "Pasta", category: "Mains", description: "Pasta dish", sellingPrice: 16, foodCost: 4.0, foodCostPct: 25, contribution: 12, menuCategory: "star" as const, allergens: ["gluten"], dietaryTags: [] },
    { itemId: "4", name: "Steak", category: "Mains", description: "Grilled steak", sellingPrice: 35, foodCost: 14, foodCostPct: 40, contribution: 21, menuCategory: "plow_horse" as const, allergens: [], dietaryTags: [] },
  ];

  it("should classify items into menu categories", () => {
    const result = engineerMenu(mockContext, mockItems);
    expect(result.analysis).toBeDefined();
    expect(result.classifiedItems).toHaveLength(mockItems.length);
  });

  it("should calculate average food cost percentage", () => {
    const result = engineerMenu(mockContext, mockItems);
    expect(result.analysis.avgFoodCostPct).toBeCloseTo((30 + 42 + 25 + 40) / 4, 1);
  });

  it("should populate stars, plowHorses, puzzles, dogs arrays", () => {
    const result = engineerMenu(mockContext, mockItems);
    const total =
      result.analysis.stars.length +
      result.analysis.plowHorses.length +
      result.analysis.puzzles.length +
      result.analysis.dogs.length;
    expect(total).toBe(mockItems.length);
  });

  it("should return empty analysis for empty items array", () => {
    const result = engineerMenu(mockContext, []);
    expect(result.analysis.avgFoodCostPct).toBe(0);
    expect(result.classifiedItems).toHaveLength(0);
  });

  it("should include recommendations when food cost is high", () => {
    const highCostItems = mockItems.map((item) => ({ ...item, foodCostPct: 40 }));
    const result = engineerMenu(mockContext, highCostItems);
    expect(Array.isArray(result.analysis.recommendations)).toBe(true);
  });
});

describe("foodCostEngine", () => {
  const { calculateRecipeCost, calculateMenuFoodCost } = require("../src/services/chef-drew/foodCostEngine");

  it("should calculate recipe cost correctly", () => {
    const recipe = {
      recipeId: "rec-1",
      name: "Chicken Tikka",
      portions: 4,
      sellingPrice: 16,
      ingredients: [
        { name: "Chicken", quantity: 1, unit: "kg", costPerUnit: 8 },
        { name: "Spices", quantity: 0.1, unit: "kg", costPerUnit: 20 },
      ],
    };
    const result = calculateRecipeCost(recipe);
    expect(result.totalCost).toBeCloseTo(10, 1);
    expect(result.costPerPortion).toBeCloseTo(2.5, 1);
    expect(result.foodCostPct).toBeCloseTo(15.625, 1);
    expect(result.grossProfit).toBeCloseTo(13.5, 1);
  });

  it("should handle zero portions gracefully", () => {
    const recipe = {
      recipeId: "rec-0",
      name: "Zero Portions",
      portions: 0,
      sellingPrice: 10,
      ingredients: [{ name: "Item", quantity: 1, unit: "unit", costPerUnit: 5 }],
    };
    const result = calculateRecipeCost(recipe);
    expect(result.costPerPortion).toBe(0);
  });

  it("should calculate menu food cost average", () => {
    const items = [{ foodCostPct: 30 } as any, { foodCostPct: 40 } as any, { foodCostPct: 20 } as any];
    expect(calculateMenuFoodCost(items)).toBeCloseTo(30, 1);
  });

  it("should return 0 for empty menu", () => {
    expect(calculateMenuFoodCost([])).toBe(0);
  });
});

describe("blueprintGenerator", () => {
  it("should generate a blueprint", async () => {
    const { generateBlueprint } = require("../src/services/chef-drew/blueprintGenerator");
    const context = {
      operationName: "Test Kitchen",
      domain: "restaurant" as const,
      cuisineStyle: "Italian",
      coversPerDay: 80,
      avgSpend: 35,
      teamSize: 8,
    };
    const result = await generateBlueprint(context, "test-session");
    expect(result).toBeDefined();
    expect(result.blueprint).toBeDefined();
    expect(result.blueprint.operationName).toBe("Test Kitchen");
    expect(result.blueprint.blueprintId).toBeDefined();
  });
});
