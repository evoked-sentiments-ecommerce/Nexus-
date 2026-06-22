// ---------------------------------------------------------------------------
// Labor Optimizer — labor cost calculation and schedule optimization
// ---------------------------------------------------------------------------

import { logInfo } from "../logger";
import { completeChat } from "../llm";
import { HospitalityContext } from "./index";

export interface StaffPosition {
  role: string;
  hoursPerWeek: number;
  hourlyRate: number;
  headcount: number;
}

export interface LaborSchedule {
  positions: StaffPosition[];
  weeklyRevenue: number;
}

export interface LaborCostResult {
  totalWeeklyLaborCost: number;
  laborPct: number;
  positions: Array<StaffPosition & { weeklyCost: number }>;
}

export interface LaborModel {
  positions: StaffPosition[];
  totalWeeklyHours: number;
  totalWeeklyCost: number;
  laborCostPct: number;
  recommendations: string[];
}

export function calculateLaborCost(schedule: LaborSchedule): LaborCostResult {
  const positions = schedule.positions.map((p) => ({
    ...p,
    weeklyCost: p.hoursPerWeek * p.hourlyRate * p.headcount,
  }));
  const totalWeeklyLaborCost = positions.reduce((s, p) => s + p.weeklyCost, 0);
  const laborPct = schedule.weeklyRevenue > 0 ? (totalWeeklyLaborCost / schedule.weeklyRevenue) * 100 : 0;

  logInfo("labor_cost_calculated", { totalWeeklyLaborCost, laborPct: laborPct.toFixed(1) });
  return { totalWeeklyLaborCost, laborPct, positions };
}

export async function optimizeSchedule(
  context: HospitalityContext,
  constraints: { maxLaborPct?: number; minStaff?: number }
): Promise<StaffPosition[]> {
  const prompt = `Optimize staffing schedule for ${context.operationName} (${context.domain}).
Team size: ${context.teamSize ?? 10}. Covers per day: ${context.coversPerDay ?? 100}.
Constraints: max labor cost ${constraints.maxLaborPct ?? 30}%, min staff ${constraints.minStaff ?? 2}.
Return optimized positions with hours and rates.`;

  await completeChat([{ role: "user", content: prompt }]);

  return [
    { role: "Head Chef", hoursPerWeek: 50, hourlyRate: 35, headcount: 1 },
    { role: "Sous Chef", hoursPerWeek: 45, hourlyRate: 25, headcount: 1 },
    { role: "Line Cook", hoursPerWeek: 40, hourlyRate: 18, headcount: Math.max(2, Math.floor((context.teamSize ?? 10) * 0.4)) },
    { role: "Front of House Manager", hoursPerWeek: 45, hourlyRate: 22, headcount: 1 },
    { role: "Server", hoursPerWeek: 35, hourlyRate: 15, headcount: Math.max(2, Math.floor((context.teamSize ?? 10) * 0.3)) },
  ];
}

export async function generateLaborModel(context: HospitalityContext): Promise<LaborModel> {
  const positions = await optimizeSchedule(context, { maxLaborPct: 30 });
  const totalWeeklyHours = positions.reduce((s, p) => s + p.hoursPerWeek * p.headcount, 0);
  const totalWeeklyCost = positions.reduce((s, p) => s + p.hoursPerWeek * p.hourlyRate * p.headcount, 0);
  const weeklyRevenue = (context.coversPerDay ?? 100) * 7 * (context.avgSpend ?? 50);
  const laborCostPct = weeklyRevenue > 0 ? (totalWeeklyCost / weeklyRevenue) * 100 : 0;

  return {
    positions,
    totalWeeklyHours,
    totalWeeklyCost,
    laborCostPct,
    recommendations: laborCostPct > 35
      ? ["Reduce staffing during off-peak hours", "Cross-train staff for multiple roles"]
      : ["Labor cost is within target range"],
  };
}
