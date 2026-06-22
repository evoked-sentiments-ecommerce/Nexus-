export type SimulationMode = "revenue" | "cost" | "labor" | "hospitality" | "business" | "marketing" | "growth";
export interface ScenarioInput {
    name: string;
    description: string;
    assumptions: Record<string, number | string>;
}
export interface SimulationRequest {
    requestId: string;
    mode: SimulationMode;
    title: string;
    baselineValues: Record<string, number>;
    scenarios: ScenarioInput[];
    periods: number;
    periodUnit: "day" | "week" | "month" | "quarter" | "year";
    requestedBy?: string;
}
export interface SimulationPeriod {
    label: string;
    index: number;
    values: Record<string, number>;
}
export interface SimulationScenarioResult {
    scenarioId: string;
    name: string;
    description: string;
    assumptions: Record<string, number | string>;
    periods: SimulationPeriod[];
    totals: Record<string, number>;
    peakValues: Record<string, number>;
    troughValues: Record<string, number>;
}
export interface SimulationResult {
    simulationId: string;
    requestId: string;
    mode: SimulationMode;
    title: string;
    scenarios: SimulationScenarioResult[];
    predictions: Record<string, number>;
    recommendations: string[];
    generatedAt: string;
}
export declare function runSimulation(request: SimulationRequest): Promise<SimulationResult>;
export declare function simulateRevenue(baseRevenue: number, periods: number, periodUnit?: SimulationRequest["periodUnit"]): Promise<SimulationResult>;
export declare function simulateCosts(baseCost: number, costBreakdown: Record<string, number>, periods: number): Promise<SimulationResult>;
export declare function simulateLabor(headcount: number, avgWage: number, periods: number): Promise<SimulationResult>;
export declare function simulateHospitality(coversPerDay: number, avgSpend: number, foodCostPct: number, laborCostPct: number, periods: number): Promise<SimulationResult>;
export declare function simulateGrowth(baseMetric: number, metricName: string, periods: number): Promise<SimulationResult>;
//# sourceMappingURL=index.d.ts.map