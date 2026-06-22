import { AgentKey, FOUNDATION_AGENT_KEYS } from "../../entities/Agent";
import { createBusinessArchitect } from "./BusinessArchitect";
import { createDesignArchitect } from "./DesignArchitect";
import { createEvolutionArchitect } from "./EvolutionArchitect";
import { createFinancialArchitect } from "./FinancialArchitect";
import { createHROrchestrator } from "./HROrchestrator";
import { createHospitalityArchitect } from "./HospitalityArchitect";
import { createMarketingArchitect } from "./MarketingArchitect";
import { createOperationsArchitect } from "./OperationsArchitect";
import { createOptimizationArchitect } from "./OptimizationArchitect";
import { createResearchArchitect } from "./ResearchArchitect";
import { createTechnologyArchitect } from "./TechnologyArchitect";

export interface AgentExecutionInput {
  sessionId: string;
  goal: string;
  objective: string | null;
  sharedMemory: Record<string, unknown>;
  predictions: Record<string, unknown>;
  simulations: Record<string, unknown>;
  goals: string[];
  research: string[];
  learning: string[];
  recommendations: string[];
  previousOutputs: Record<string, unknown>;
}

export interface AgentDecisionResult {
  decision: string;
  reasoning: string;
  confidence: number;
  alternatives: string[];
  recommendations: string[];
  expectedOutcome: string;
}

export interface AgentExecutionOutput {
  agentKey: AgentKey;
  summary: string;
  memory: string[];
  predictions: string[];
  simulations: string[];
  goals: string[];
  research: string[];
  learning: string[];
  recommendations: string[];
  contribution: Record<string, unknown>;
  decision: AgentDecisionResult;
}

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  domain: string;
  specialties: string[];
  collaborateWith: AgentKey[];
  execute(input: AgentExecutionInput): Promise<AgentExecutionOutput>;
}

function buildSpecialistAgent(
  key: AgentKey,
  name: string,
  domain: string,
  specialties: string[],
  collaborateWith: AgentKey[]
): AgentDefinition {
  return {
    key,
    name,
    domain,
    specialties,
    collaborateWith,
    async execute(input: AgentExecutionInput): Promise<AgentExecutionOutput> {
      const objective = input.objective ?? input.goal;
      return {
        agentKey: key,
        summary: `${name} aligned ${domain} strategy for ${objective}.`,
        memory: [`${name} recorded ${domain} intelligence for ${objective}.`],
        predictions: [`${name} forecasted ${domain} outcomes for ${objective}.`],
        simulations: [`${name} simulated ${domain} trade-offs for ${objective}.`],
        goals: [`${name} defined ${domain} goals for ${objective}.`],
        research: [`${name} captured ${domain} findings for ${objective}.`],
        learning: [`${name} identified ${domain} learning loops for ${objective}.`],
        recommendations: [`${name} recommends execution against the ${domain} plan.`],
        contribution: {
          objective,
          domain,
          specialties,
          collaboratorCount: collaborateWith.length,
        },
        decision: {
          decision: `${name} approves the ${domain} execution plan.`,
          reasoning: `${name} validated the goal against ${domain} priorities and dependencies.`,
          confidence: 78,
          alternatives: [
            `Delay ${domain} execution until additional validation is available.`,
            `Reduce ${domain} scope and iterate in staged releases.`,
          ],
          recommendations: [`Run weekly ${domain} retrospectives and update shared memory.`],
          expectedOutcome: `${domain} execution quality improves with cross-agent collaboration.`,
        },
      };
    },
  };
}

export class AgentRegistry {
  private readonly agents = new Map<AgentKey, AgentDefinition>();

  constructor() {
    this.register(createResearchArchitect());
    this.register(createBusinessArchitect());
    this.register(createFinancialArchitect());
    this.register(createHospitalityArchitect());
    this.register(createDesignArchitect());
    this.register(createTechnologyArchitect());
    this.register(createMarketingArchitect());
    this.register(createHROrchestrator());
    this.register(createOperationsArchitect());
    this.register(createOptimizationArchitect());
    this.register(createEvolutionArchitect());

    this.register(
      buildSpecialistAgent(
        "menu_architect",
        "Menu Architect",
        "hospitality",
        ["menu engineering", "offer design", "pricing"],
        ["hospitality_architect", "food_cost_architect", "marketing_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "food_cost_architect",
        "Food Cost Architect",
        "finance",
        ["food cost", "margin controls", "supplier optimization"],
        ["menu_architect", "financial_architect", "operations_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "labor_architect",
        "Labor Architect",
        "operations",
        ["staffing models", "labor forecasting", "shift strategy"],
        ["hr_orchestrator", "operations_architect", "training_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "training_architect",
        "Training Architect",
        "hr",
        ["playbooks", "upskilling", "operating standards"],
        ["labor_architect", "guest_experience_architect", "operations_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "guest_experience_architect",
        "Guest Experience Architect",
        "hospitality",
        ["journey mapping", "service quality", "guest satisfaction"],
        ["hospitality_architect", "training_architect", "marketing_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "hotel_architect",
        "Hotel Architect",
        "hospitality",
        ["hotel operations", "property systems", "amenity strategy"],
        ["hospitality_architect", "technology_architect", "operations_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "resort_architect",
        "Resort Architect",
        "hospitality",
        ["resort operations", "guest programming", "experience design"],
        ["hospitality_architect", "design_architect", "financial_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "private_club_architect",
        "Private Club Architect",
        "hospitality",
        ["membership models", "premium service", "club governance"],
        ["hospitality_architect", "financial_architect", "operations_architect"]
      )
    );
    this.register(
      buildSpecialistAgent(
        "hr_architect",
        "HR Architect",
        "hr",
        ["talent planning", "org design", "performance systems"],
        ["hr_orchestrator", "operations_architect", "training_architect"]
      )
    );
  }

  register(agent: AgentDefinition): void {
    this.agents.set(agent.key, agent);
  }

  get(agentKey: AgentKey): AgentDefinition | null {
    return this.agents.get(agentKey) ?? null;
  }

  list(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  recommend(goal: string): AgentKey[] {
    const normalized = goal.toLowerCase();
    const scored = this.list().map((agent) => {
      const specialtyScore = agent.specialties.reduce((score, item) => {
        return score + (normalized.includes(item.split(" ")[0]) ? 1 : 0);
      }, 0);
      const domainScore = normalized.includes(agent.domain) ? 2 : 0;
      return { key: agent.key, score: specialtyScore + domainScore };
    });

    const ranked = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.key);

    if (ranked.length > 0) {
      return ranked.slice(0, 7);
    }

    return FOUNDATION_AGENT_KEYS.slice(0, 6) as AgentKey[];
  }
}
