"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationService = void 0;
const crypto_1 = require("crypto");
const chef_drew_1 = require("../chef-drew");
const registry_1 = require("../capability-discovery/registry");
const learning_1 = require("../learning");
const memory_1 = require("../memory");
const planner_1 = require("../planner");
const reasoning_1 = require("../reasoning");
const ImpactAnalyzer_1 = require("./ImpactAnalyzer");
const OptimizationEngine_1 = require("./OptimizationEngine");
const ScenarioEngine_1 = require("./ScenarioEngine");
class SimulationService {
    constructor(scenarioEngine = new ScenarioEngine_1.ScenarioEngine(), impactAnalyzer = new ImpactAnalyzer_1.ImpactAnalyzer(), optimizationEngine = new OptimizationEngine_1.OptimizationEngine()) {
        this.scenarioEngine = scenarioEngine;
        this.impactAnalyzer = impactAnalyzer;
        this.optimizationEngine = optimizationEngine;
        this.simulations = new Map();
    }
    async createSimulation(input) {
        const simulationInput = {
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
            const chefModel = await (0, chef_drew_1.generateCostModel)({
                operationName: String(input.context.operationName ?? "Chef Drew Simulation"),
                domain: "restaurant",
                coversPerDay: Number(input.context.coversPerDay ?? 100),
                avgSpend: Number(input.context.avgSpend ?? 40),
                teamSize: Number(input.context.teamSize ?? 20),
            });
            impacts.push({
                name: "Prime Cost Impact",
                value: Number((chefModel.primeCost - (input.baseline.primeCost ?? chefModel.primeCost)).toFixed(2)),
                direction: chefModel.primeCost > (input.baseline.primeCost ?? chefModel.primeCost)
                    ? "increase"
                    : chefModel.primeCost < (input.baseline.primeCost ?? chefModel.primeCost)
                        ? "decrease"
                        : "neutral",
            });
        }
        catch {
            // Keep simulation execution resilient when optional hospitality modeling is unavailable.
        }
        const recommendationScore = this.optimizationEngine.score(impacts);
        const recommendations = this.optimizationEngine.recommendations(impacts, recommendationScore);
        const simulation = {
            id: (0, crypto_1.randomUUID)(),
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
    async listSimulations() {
        return Array.from(this.simulations.values());
    }
    async getSimulation(id) {
        return this.simulations.get(id) ?? null;
    }
    async integrateSignals(simulation) {
        await Promise.allSettled([
            (0, learning_1.captureSignal)({
                userId: simulation.requestedBy ?? "system",
                entityType: "simulation",
                entityId: simulation.id,
                signal: "accepted",
                context: { recommendationScore: simulation.recommendationScore },
            }),
            (0, memory_1.upsertMemoryEntry)({
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
            (0, planner_1.buildPlan)({
                id: simulation.id,
                title: `Execute simulation: ${simulation.title}`,
                description: "Operationalize best scenario from simulation results",
                priority: simulation.recommendationScore >= 80 ? "high" : "medium",
            }),
            (0, reasoning_1.analyseRisks)({
                domain: "simulation",
                projectId: simulation.id,
                inputs: { impacts: simulation.impacts, recommendationScore: simulation.recommendationScore },
            }),
            (0, reasoning_1.supportDecision)(`Should Nexus execute simulation ${simulation.title}?`, {
                domain: "simulation",
                projectId: simulation.id,
                inputs: { recommendationScore: simulation.recommendationScore, recommendations: simulation.recommendations },
            }),
            (0, registry_1.recordUsage)("strategic_planning"),
        ]);
    }
}
exports.SimulationService = SimulationService;
//# sourceMappingURL=SimulationService.js.map