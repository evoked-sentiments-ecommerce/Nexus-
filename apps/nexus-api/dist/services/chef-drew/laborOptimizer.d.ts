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
    positions: Array<StaffPosition & {
        weeklyCost: number;
    }>;
}
export interface LaborModel {
    positions: StaffPosition[];
    totalWeeklyHours: number;
    totalWeeklyCost: number;
    laborCostPct: number;
    recommendations: string[];
}
export declare function calculateLaborCost(schedule: LaborSchedule): LaborCostResult;
export declare function optimizeSchedule(context: HospitalityContext, constraints: {
    maxLaborPct?: number;
    minStaff?: number;
}): Promise<StaffPosition[]>;
export declare function generateLaborModel(context: HospitalityContext): Promise<LaborModel>;
//# sourceMappingURL=laborOptimizer.d.ts.map