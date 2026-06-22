import { AgentKey } from "./Agent";

export interface AgentDecision {
  id: string;
  sessionId: string;
  agentId: AgentKey;
  decision: string;
  reasoning: string;
  confidence: number;
  alternatives: string[];
  recommendations: string[];
  expectedOutcome: string;
  createdAt: string;
}

export function normalizeConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}
