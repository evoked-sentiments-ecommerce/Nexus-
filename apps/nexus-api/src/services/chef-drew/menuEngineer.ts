// ---------------------------------------------------------------------------
// Menu Engineer — food cost analysis and menu engineering classification
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";
import { MenuItem, Menu, MenuEngineeringAnalysis, HospitalityContext } from "./index";
import { completeChat } from "../llm";

export interface MenuEngineeringResult {
  analysis: MenuEngineeringAnalysis;
  classifiedItems: MenuItem[];
}

export function engineerMenu(context: HospitalityContext, items: MenuItem[]): MenuEngineeringResult {
  if (items.length === 0) {
    return {
      analysis: { avgFoodCostPct: 0, avgContribution: 0, stars: [], plowHorses: [], puzzles: [], dogs: [], recommendations: [] },
      classifiedItems: [],
    };
  }

  const avgFoodCostPct = items.reduce((s, i) => s + i.foodCostPct, 0) / items.length;
  const avgContribution = items.reduce((s, i) => s + i.contribution, 0) / items.length;

  const classified = items.map((item) => ({
    ...item,
    menuCategory: classifyItem(item, avgFoodCostPct, avgContribution) as MenuItem["menuCategory"],
  }));

  const stars = classified.filter((i) => i.menuCategory === "star").map((i) => i.name);
  const plowHorses = classified.filter((i) => i.menuCategory === "plow_horse").map((i) => i.name);
  const puzzles = classified.filter((i) => i.menuCategory === "puzzle").map((i) => i.name);
  const dogs = classified.filter((i) => i.menuCategory === "dog").map((i) => i.name);

  const recommendations: string[] = [];
  if (dogs.length > 0) {
    recommendations.push(`Consider removing or reimagining: ${dogs.join(", ")}`);
  }
  if (puzzles.length > 0) {
    recommendations.push(`Increase visibility of: ${puzzles.join(", ")}`);
  }
  if (avgFoodCostPct > 35) {
    recommendations.push("Overall food cost % is high — review portion sizes and ingredient costs");
  }

  logInfo("menu_engineered", { operation: context.operationName, itemCount: items.length, avgFoodCostPct });

  return {
    analysis: { avgFoodCostPct, avgContribution, stars, plowHorses, puzzles, dogs, recommendations },
    classifiedItems: classified,
  };
}

function classifyItem(item: MenuItem, avgFoodCostPct: number, avgContribution: number): string {
  const isLowCost = item.foodCostPct <= avgFoodCostPct;
  const isHighContribution = item.contribution >= avgContribution;
  if (isLowCost && isHighContribution) {
    return "star";
  }
  if (!isLowCost && isHighContribution) {
    return "plow_horse";
  }
  if (isLowCost && !isHighContribution) {
    return "puzzle";
  }
  return "dog";
}

export async function generateMenuStructure(context: HospitalityContext): Promise<Partial<Menu>> {
  const prompt = `Create a menu structure for a ${context.domain} called "${context.operationName}". 
Style: ${context.cuisineStyle ?? "modern"}. Average spend: $${context.avgSpend ?? 50}.
Return a JSON structure with sections and sample items.`;

  await completeChat([{ role: "user", content: prompt }], { temperature: 0.8 });

  return {
    menuId: `menu-${Date.now()}`,
    name: `${context.operationName} Menu`,
    operationName: context.operationName,
    concept: context.cuisineStyle ?? "Contemporary",
    sections: [],
    generatedAt: new Date().toISOString(),
  };
}
