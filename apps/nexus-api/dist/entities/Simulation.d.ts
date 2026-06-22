export declare const SIMULATION_CHANGE_TYPES: readonly ["Price Changes", "Menu Changes", "Labor Changes", "Inventory Changes", "Marketing Changes", "Location Changes", "Business Model Changes", "Operational Changes"];
export type SimulationChangeType = (typeof SIMULATION_CHANGE_TYPES)[number];
export interface SimulationChange {
    type: SimulationChangeType;
    magnitudePct: number;
    note?: string;
}
export interface SimulationInput {
    baseline: Record<string, number>;
    changes: SimulationChange[];
    horizonPeriods: number;
    periodUnit: "day" | "week" | "month" | "quarter" | "year";
    context: Record<string, unknown>;
}
export interface SimulationImpact {
    name: string;
    value: number;
    direction: "increase" | "decrease" | "neutral";
}
export interface Simulation {
    id: string;
    title: string;
    requestedBy: string | null;
    input: SimulationInput;
    impacts: SimulationImpact[];
    recommendationScore: number;
    recommendations: string[];
    createdAt: string;
    updatedAt: string;
}
export declare function parseSimulationChangeType(value: unknown): SimulationChangeType;
//# sourceMappingURL=Simulation.d.ts.map