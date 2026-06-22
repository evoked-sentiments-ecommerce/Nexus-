"use strict";
// ---------------------------------------------------------------------------
// Food Cost Engine — recipe costing, menu cost analysis
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRecipeCost = calculateRecipeCost;
exports.calculateMenuFoodCost = calculateMenuFoodCost;
exports.generateCostingWorkbook = generateCostingWorkbook;
const logger_1 = require("../logger");
function calculateRecipeCost(recipe) {
    const totalCost = recipe.ingredients.reduce((sum, ing) => sum + ing.quantity * ing.costPerUnit, 0);
    const costPerPortion = recipe.portions > 0 ? totalCost / recipe.portions : 0;
    const foodCostPct = recipe.sellingPrice > 0 ? (costPerPortion / recipe.sellingPrice) * 100 : 0;
    const grossProfit = recipe.sellingPrice - costPerPortion;
    (0, logger_1.logInfo)("recipe_cost_calculated", { recipeId: recipe.recipeId, foodCostPct: foodCostPct.toFixed(1) });
    return { recipeId: recipe.recipeId, name: recipe.name, totalCost, costPerPortion, foodCostPct, grossProfit };
}
function calculateMenuFoodCost(items) {
    if (items.length === 0) {
        return 0;
    }
    return items.reduce((sum, item) => sum + item.foodCostPct, 0) / items.length;
}
async function generateCostingWorkbook(items) {
    const data = items.map((item) => ({
        name: item.name,
        sellingPrice: item.sellingPrice,
        foodCost: item.foodCost,
        foodCostPct: `${item.foodCostPct.toFixed(1)}%`,
        contribution: item.contribution,
        category: item.menuCategory,
    }));
    (0, logger_1.logInfo)("costing_workbook_generated", { itemCount: items.length });
    return { filename: `food-cost-${Date.now()}.xlsx`, data };
}
//# sourceMappingURL=foodCostEngine.js.map