import { SimulationChange, SimulationInput } from "../../entities/Simulation";
export interface ScenarioResult {
    scenarioId: string;
    name: string;
    values: Record<string, number>;
    changes: SimulationChange[];
}
export declare class ScenarioEngine {
    buildScenarios(input: SimulationInput): ScenarioResult[];
    private buildBlendedValues;
}
//# sourceMappingURL=ScenarioEngine.d.ts.map