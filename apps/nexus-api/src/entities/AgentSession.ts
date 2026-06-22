import { AgentKey } from "./Agent";

export type AgentSessionStatus = "planning" | "executing" | "completed" | "failed";

export interface SharedAgentContext {
  memory: Record<string, unknown>;
  predictions: Record<string, unknown>;
  simulations: Record<string, unknown>;
  goals: string[];
  research: string[];
  learning: string[];
  recommendations: string[];
}

export interface AgentSession {
  id: string;
  goal: string;
  objective: string | null;
  status: AgentSessionStatus;
  participatingAgentIds: AgentKey[];
  sharedContext: SharedAgentContext;
  unifiedExecutionPlan: string[];
  mergedOutputs: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export function createEmptySharedAgentContext(): SharedAgentContext {
  return {
    memory: {},
    predictions: {},
    simulations: {},
    goals: [],
    research: [],
    learning: [],
    recommendations: [],
  };
}

export function parseAgentSessionStatus(value: unknown): AgentSessionStatus {
  if (value === "planning" || value === "executing" || value === "completed" || value === "failed") {
    return value;
  }

  return "planning";
}
