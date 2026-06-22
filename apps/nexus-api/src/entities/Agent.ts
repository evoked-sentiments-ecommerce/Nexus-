export const FOUNDATION_AGENT_KEYS = [
  "research_architect",
  "business_architect",
  "financial_architect",
  "hospitality_architect",
  "design_architect",
  "technology_architect",
  "marketing_architect",
  "hr_orchestrator",
  "operations_architect",
  "optimization_architect",
  "evolution_architect",
] as const;

export const NEXUS_BUSINESS_AGENT_KEYS = [
  "business_architect",
  "financial_architect",
  "marketing_architect",
  "hr_architect",
  "technology_architect",
  "operations_architect",
] as const;

export const CHEF_DREW_AGENT_KEYS = [
  "hospitality_architect",
  "menu_architect",
  "food_cost_architect",
  "labor_architect",
  "training_architect",
  "guest_experience_architect",
  "hotel_architect",
  "resort_architect",
  "private_club_architect",
] as const;

export type FoundationAgentKey = (typeof FOUNDATION_AGENT_KEYS)[number];
export type NexusBusinessAgentKey = (typeof NEXUS_BUSINESS_AGENT_KEYS)[number];
export type ChefDrewAgentKey = (typeof CHEF_DREW_AGENT_KEYS)[number];
export type AgentKey = FoundationAgentKey | NexusBusinessAgentKey | ChefDrewAgentKey;

export type AgentStatus = "active" | "inactive" | "training";

export interface AgentPerformance {
  accuracy: number;
  effectiveness: number;
  contribution: number;
  collaborationQuality: number;
}

export interface Agent {
  id: string;
  key: AgentKey;
  name: string;
  domain: string;
  specialty: string;
  status: AgentStatus;
  capabilities: string[];
  collaborationTargets: AgentKey[];
  performance: AgentPerformance;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const AGENT_KEY_SET = new Set<string>([
  ...FOUNDATION_AGENT_KEYS,
  ...NEXUS_BUSINESS_AGENT_KEYS,
  ...CHEF_DREW_AGENT_KEYS,
]);

export function parseAgentKey(value: unknown): AgentKey {
  if (typeof value === "string" && AGENT_KEY_SET.has(value)) {
    return value as AgentKey;
  }

  return "research_architect";
}

export function parseAgentStatus(value: unknown): AgentStatus {
  if (value === "active" || value === "inactive" || value === "training") {
    return value;
  }

  return "active";
}
