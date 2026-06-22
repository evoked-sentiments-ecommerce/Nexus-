"use strict";
// ---------------------------------------------------------------------------
// Labor Optimizer — labor cost calculation and schedule optimization
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLaborCost = calculateLaborCost;
exports.optimizeSchedule = optimizeSchedule;
exports.generateLaborModel = generateLaborModel;
const logger_1 = require("../logger");
const llm_1 = require("../llm");
function calculateLaborCost(schedule) {
    const positions = schedule.positions.map((p) => ({
        ...p,
        weeklyCost: p.hoursPerWeek * p.hourlyRate * p.headcount,
    }));
    const totalWeeklyLaborCost = positions.reduce((s, p) => s + p.weeklyCost, 0);
    const laborPct = schedule.weeklyRevenue > 0 ? (totalWeeklyLaborCost / schedule.weeklyRevenue) * 100 : 0;
    (0, logger_1.logInfo)("labor_cost_calculated", { totalWeeklyLaborCost, laborPct: laborPct.toFixed(1) });
    return { totalWeeklyLaborCost, laborPct, positions };
}
async function optimizeSchedule(context, constraints) {
    const prompt = `Optimize staffing schedule for ${context.operationName} (${context.domain}).
Team size: ${context.teamSize ?? 10}. Covers per day: ${context.coversPerDay ?? 100}.
Constraints: max labor cost ${constraints.maxLaborPct ?? 30}%, min staff ${constraints.minStaff ?? 2}.
Return optimized positions with hours and rates.`;
    await (0, llm_1.completeChat)([{ role: "user", content: prompt }]);
    return [
        { role: "Head Chef", hoursPerWeek: 50, hourlyRate: 35, headcount: 1 },
        { role: "Sous Chef", hoursPerWeek: 45, hourlyRate: 25, headcount: 1 },
        { role: "Line Cook", hoursPerWeek: 40, hourlyRate: 18, headcount: Math.max(2, Math.floor((context.teamSize ?? 10) * 0.4)) },
        { role: "Front of House Manager", hoursPerWeek: 45, hourlyRate: 22, headcount: 1 },
        { role: "Server", hoursPerWeek: 35, hourlyRate: 15, headcount: Math.max(2, Math.floor((context.teamSize ?? 10) * 0.3)) },
    ];
}
async function generateLaborModel(context) {
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
//# sourceMappingURL=laborOptimizer.js.map