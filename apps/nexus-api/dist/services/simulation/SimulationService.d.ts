import { Simulation, SimulationChange } from "../../entities/Simulation";
import { ImpactAnalyzer } from "./ImpactAnalyzer";
import { OptimizationEngine } from "./OptimizationEngine";
import { ScenarioEngine } from "./ScenarioEngine";
export interface CreateSimulationInput {
    title: string;
    requestedBy: string | null;
    baseline: Record<string, number>;
    changes: SimulationChange[];
    horizonPeriods: number;
    periodUnit: "day" | "week" | "month" | "quarter" | "year";
    context: Record<string, unknown>;
}
export declare class SimulationService {
    private readonly scenarioEngine;
    private readonly impactAnalyzer;
    private readonly optimizationEngine;
    private readonly simulations;
    constructor(scenarioEngine?: ScenarioEngine, impactAnalyzer?: ImpactAnalyzer, optimizationEngine?: OptimizationEngine);
    createSimulation(input: CreateSimulationInput): Promise<Simulation>;
    listSimulations(): Promise<Simulation[]>;
    getSimulation(id: string): Promise<Simulation | null>;
    private integrateSignals;
}
//# sourceMappingURL=SimulationService.d.ts.map