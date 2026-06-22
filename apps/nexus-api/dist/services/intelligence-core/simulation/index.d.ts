export type SimulationDomain = "revenue" | "cost" | "labor" | "hospitality" | "business" | "marketing" | "growth";
export interface SimulationParameters {
    domain: SimulationDomain;
    baselineValues: Record<string, number>;
    variables: SimulationVariable[];
    periods: number;
    periodUnit: "day" | "week" | "month" | "quarter" | "year";
    iterations?: number;
}
export interface SimulationVariable {
    name: string;
    min: number;
    max: number;
    distribution: "uniform" | "normal" | "triangular";
    mostLikely?: number;
}
export interface SimulationPeriodResult {
    period: number;
    label: string;
    values: Record<string, number>;
}
export interface SimulationScenario {
    scenarioId: string;
    name: string;
    description: string;
    parameters: Record<string, number>;
    results: SimulationPeriodResult[];
    summary: Record<string, number>;
}
export interface SimulationOutput {
    simulationId: string;
    domain: SimulationDomain;
    scenarios: SimulationScenario[];
    predictions: Record<string, number>;
    recommendations: string[];
    generatedAt: string;
}
export declare function runSimulation(params: SimulationParameters): Promise<SimulationOutput>;
export declare function simulateRevenue(baseline: number, growthRates: number[], periods: number): Promise<SimulationOutput>;
export declare function simulateCosts(baseline: number, costDrivers: Record<string, number>, periods: number): Promise<SimulationOutput>;
export declare function simulateLabor(headcount: number, avgWage: number, periods: number): Promise<SimulationOutput>;
export declare function simulateGrowth(baseRevenue: number, targetGrowthRate: number, periods: number): Promise<SimulationOutput>;
//# sourceMappingURL=index.d.ts.map