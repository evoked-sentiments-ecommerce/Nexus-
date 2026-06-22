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
export declare function calculateRecipeCost(recipe: Recipe): RecipeCostResult;
export declare function calculateMenuFoodCost(items: MenuItem[]): number;
export declare function generateCostingWorkbook(items: MenuItem[]): Promise<{
    filename: string;
    data: Record<string, unknown>[];
}>;
//# sourceMappingURL=foodCostEngine.d.ts.map