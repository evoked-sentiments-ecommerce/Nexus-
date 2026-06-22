import { randomUUID } from "crypto";
import { Simulation, SimulationChange, SimulationInput } from "../../entities/Simulation";
import { generateCostModel } from "../chef-drew";
import { recordUsage } from "../capability-discovery/registry";
import { captureSignal } from "../learning";
import { upsertMemoryEntry } from "../memory";
import { buildPlan } from "../planner";
import { analyseRisks, supportDecision } from "../reasoning";
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

export class SimulationService {
  private readonly simulations = new Map<string, Simulation>();

  constructor(
    private readonly scenarioEngine = new ScenarioEngine(),
    private readonly impactAnalyzer = new ImpactAnalyzer(),
    private readonly optimizationEngine = new OptimizationEngine()
  ) {}

  async createSimulation(input: CreateSimulationInput): Promise<Simulation> {
    const simulationInput: SimulationInput = {
      baseline: input.baseline,
      changes: input.changes,
      horizonPeriods: input.horizonPeriods,
      periodUnit: input.periodUnit,
      context: input.context,
    };

    const scenarios = this.scenarioEngine.buildScenarios(simulationInput);
    const baselineScenario = scenarios[0];
    const blendedScenario = scenarios[scenarios.length - 1];

    const impacts = this.impactAnalyzer.analyze(baselineScenario, blendedScenario);

    try {
      const chefModel = await generateCostModel({
        operationName: String(input.context.operationName ?? "Chef Drew Simulation"),
        domain: "restaurant",
        coversPerDay: Number(input.context.coversPerDay ?? 100),
        avgSpend: Number(input.context.avgSpend ?? 40),
        teamSize: Number(input.context.teamSize ?? 20),
      });

      impacts.push({
        name: "Prime Cost Impact",
        value: Number((chefModel.primeCost - (input.baseline.primeCost ?? chefModel.primeCost)).toFixed(2)),
        direction:
          chefModel.primeCost > (input.baseline.primeCost ?? chefModel.primeCost)
            ? "increase"
            : chefModel.primeCost < (input.baseline.primeCost ?? chefModel.primeCost)
            ? "decrease"
            : "neutral",
      });
    } catch {
      // Keep simulation execution resilient when optional hospitality modeling is unavailable.
    }

    const recommendationScore = this.optimizationEngine.score(impacts);
    const recommendations = this.optimizationEngine.recommendations(impacts, recommendationScore);

    const simulation: Simulation = {
      id: randomUUID(),
      title: input.title,
      requestedBy: input.requestedBy,
      input: simulationInput,
      impacts,
      recommendationScore,
      recommendations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.simulations.set(simulation.id, simulation);
    await this.integrateSignals(simulation);

    return simulation;
  }

  async listSimulations(): Promise<Simulation[]> {
    return Array.from(this.simulations.values());
  }

  async getSimulation(id: string): Promise<Simulation | null> {
    return this.simulations.get(id) ?? null;
  }

  private async integrateSignals(simulation: Simulation): Promise<void> {
    await Promise.allSettled([
      captureSignal({
        userId: simulation.requestedBy ?? "system",
        entityType: "simulation",
        entityId: simulation.id,
        signal: "accepted",
        context: { recommendationScore: simulation.recommendationScore },
      }),
      upsertMemoryEntry({
        sessionId: `simulation-${simulation.id}`,
        sourceAgent: "simulation-engine",
        domain: "simulation",
        content: `Created simulation ${simulation.title} with recommendation score ${simulation.recommendationScore.toFixed(2)}.`,
        tags: ["simulation", "what-if"],
        metadata: {
          simulationId: simulation.id,
          recommendationScore: simulation.recommendationScore,
          changeCount: simulation.input.changes.length,
        },
      }),
      buildPlan({
        id: simulation.id,
        title: `Execute simulation: ${simulation.title}`,
        description: "Operationalize best scenario from simulation results",
        priority: simulation.recommendationScore >= 80 ? "high" : "medium",
      }),
      analyseRisks({
        domain: "simulation",
        projectId: simulation.id,
        inputs: { impacts: simulation.impacts, recommendationScore: simulation.recommendationScore },
      }),
      supportDecision(`Should Nexus execute simulation ${simulation.title}?`, {
        domain: "simulation",
        projectId: simulation.id,
        inputs: { recommendationScore: simulation.recommendationScore, recommendations: simulation.recommendations },
      }),
      recordUsage("strategic_planning"),
    ]);
  }
}
