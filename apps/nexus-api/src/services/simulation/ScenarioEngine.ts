import { SimulationChange, SimulationInput } from "../../entities/Simulation";

export interface ScenarioResult {
  scenarioId: string;
  name: string;
  values: Record<string, number>;
  changes: SimulationChange[];
}

export class ScenarioEngine {
  buildScenarios(input: SimulationInput): ScenarioResult[] {
    const baselineScenario: ScenarioResult = {
      scenarioId: `scn-baseline-${Date.now()}`,
      name: "Baseline",
      values: { ...input.baseline },
      changes: [],
    };

    const candidateScenarios = input.changes.map((change, index) => {
      const delta = change.magnitudePct / 100;
      const values = Object.fromEntries(
        Object.entries(input.baseline).map(([key, value]) => [
          key,
          Number((value * (1 + delta)).toFixed(2)),
        ])
      );

      return {
        scenarioId: `scn-${index + 1}-${Date.now()}`,
        name: change.type,
        values,
        changes: [change],
      };
    });

    const blendedScenario: ScenarioResult = {
      scenarioId: `scn-blended-${Date.now()}`,
      name: "Blended",
      values: this.buildBlendedValues(input),
      changes: input.changes,
    };

    return [baselineScenario, ...candidateScenarios, blendedScenario];
  }

  private buildBlendedValues(input: SimulationInput): Record<string, number> {
    const totalChangePct = input.changes.reduce((sum, change) => sum + change.magnitudePct, 0);
    const blendedDelta = totalChangePct / Math.max(input.changes.length, 1) / 100;

    return Object.fromEntries(
      Object.entries(input.baseline).map(([key, value]) => [
        key,
        Number((value * (1 + blendedDelta)).toFixed(2)),
      ])
    );
  }
}
