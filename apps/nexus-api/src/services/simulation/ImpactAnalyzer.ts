import { SimulationImpact } from "../../entities/Simulation";
import { ScenarioResult } from "./ScenarioEngine";

export class ImpactAnalyzer {
  analyze(
    baseline: ScenarioResult,
    scenario: ScenarioResult
  ): SimulationImpact[] {
    const revenueImpact = this.metricImpact(
      "Revenue Impact",
      baseline.values.revenue ?? baseline.values.Revenue ?? baseline.values.sales ?? 0,
      scenario.values.revenue ?? scenario.values.Revenue ?? scenario.values.sales ?? 0
    );

    const guestRetentionImpact = this.metricImpact(
      "Guest Retention Impact",
      baseline.values.guestRetention ?? baseline.values.guests ?? 0,
      scenario.values.guestRetention ?? scenario.values.guests ?? 0
    );

    const profitImpact = this.metricImpact(
      "Profit Impact",
      baseline.values.profit ?? baseline.values.margin ?? 0,
      scenario.values.profit ?? scenario.values.margin ?? 0
    );

    const foodCostImpact = this.metricImpact(
      "Food Cost Impact",
      baseline.values.foodCost ?? 0,
      scenario.values.foodCost ?? 0
    );

    const laborImpact = this.metricImpact(
      "Labor Impact",
      baseline.values.laborCost ?? baseline.values.labor ?? 0,
      scenario.values.laborCost ?? scenario.values.labor ?? 0
    );

    return [revenueImpact, guestRetentionImpact, profitImpact, foodCostImpact, laborImpact];
  }

  private metricImpact(name: string, baselineValue: number, scenarioValue: number): SimulationImpact {
    const delta = Number((scenarioValue - baselineValue).toFixed(2));
    return {
      name,
      value: delta,
      direction: delta > 0 ? "increase" : delta < 0 ? "decrease" : "neutral",
    };
  }
}
