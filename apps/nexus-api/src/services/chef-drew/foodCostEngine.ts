// ---------------------------------------------------------------------------
// Food Cost Engine — recipe costing, menu cost analysis
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";
import { MenuItem } from "./index";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface Recipe {
  recipeId: string;
  name: string;
  portions: number;
  ingredients: Ingredient[];
  sellingPrice: number;
}

export interface RecipeCostResult {
  recipeId: string;
  name: string;
  totalCost: number;
  costPerPortion: number;
  foodCostPct: number;
  grossProfit: number;
}

export interface MenuCostResult {
  totalItems: number;
  avgFoodCostPct: number;
  avgGrossProfit: number;
  itemResults: RecipeCostResult[];
}

export function calculateRecipeCost(recipe: Recipe): RecipeCostResult {
  const totalCost = recipe.ingredients.reduce((sum, ing) => sum + ing.quantity * ing.costPerUnit, 0);
  const costPerPortion = recipe.portions > 0 ? totalCost / recipe.portions : 0;
  const foodCostPct = recipe.sellingPrice > 0 ? (costPerPortion / recipe.sellingPrice) * 100 : 0;
  const grossProfit = recipe.sellingPrice - costPerPortion;

  logInfo("recipe_cost_calculated", { recipeId: recipe.recipeId, foodCostPct: foodCostPct.toFixed(1) });

  return { recipeId: recipe.recipeId, name: recipe.name, totalCost, costPerPortion, foodCostPct, grossProfit };
}

export function calculateMenuFoodCost(items: MenuItem[]): number {
  if (items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => sum + item.foodCostPct, 0) / items.length;
}

export async function generateCostingWorkbook(items: MenuItem[]): Promise<{ filename: string; data: Record<string, unknown>[] }> {
  const data = items.map((item) => ({
    name: item.name,
    sellingPrice: item.sellingPrice,
    foodCost: item.foodCost,
    foodCostPct: `${item.foodCostPct.toFixed(1)}%`,
    contribution: item.contribution,
    category: item.menuCategory,
  }));

  logInfo("costing_workbook_generated", { itemCount: items.length });
  return { filename: `food-cost-${Date.now()}.xlsx`, data };
}
