import { AgentDefinition, AgentExecutionInput } from "./AgentRegistry";

export function createResearchArchitect(): AgentDefinition {
  return {
    key: "research_architect",
    name: "Research Architect",
    domain: "research",
    specialties: ["market intelligence", "trend analysis", "competitive positioning"],
    collaborateWith: ["business_architect", "marketing_architect", "evolution_architect"],
    async execute(input: AgentExecutionInput) {
      const target = input.objective ?? input.goal;
      return {
        agentKey: "research_architect",
        summary: `Research intelligence produced for ${target}.`,
        memory: [`Research Architect captured market memory for ${target}.`],
        predictions: [`Demand forecast generated for ${target}.`],
        simulations: [`Scenario simulation drafted for ${target}.`],
        goals: [`Validate demand assumptions before execution for ${target}.`],
        research: [`Competitive landscape and market timing insights were produced for ${target}.`],
        learning: ["Track forecast accuracy against actual market movement."],
        recommendations: ["Use research baselines as default assumptions for all downstream agents."],
        contribution: {
          marketReadiness: "high",
          coreDrivers: ["demand", "competitive whitespace", "timing"],
        },
        decision: {
          decision: "Proceed with a research-backed execution strategy.",
          reasoning: "Market demand and positioning indicators support coordinated execution.",
          confidence: 82,
          alternatives: ["Delay launch for more signals.", "Pilot in a smaller segment first."],
          recommendations: ["Refresh market analysis weekly while the session is active."],
          expectedOutcome: "Higher strategic fit and reduced market-entry risk.",
        },
      };
    },
  };
}
