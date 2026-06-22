import { AgentDecision } from "../../entities/AgentDecision";
import { QueryResult, query } from "../connection";

interface AgentDecisionRow {
  id: string;
  session_id: string;
  agent_id: string;
  decision: string;
  reasoning: string;
  confidence: number;
  alternatives: string[] | null;
  recommendations: string[] | null;
  expected_outcome: string;
  created_at: unknown;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function mapRow(row: AgentDecisionRow): AgentDecision {
  return {
    id: row.id,
    sessionId: row.session_id,
    agentId: row.agent_id as AgentDecision["agentId"],
    decision: row.decision,
    reasoning: row.reasoning,
    confidence: row.confidence,
    alternatives: row.alternatives ?? [],
    recommendations: row.recommendations ?? [],
    expectedOutcome: row.expected_outcome,
    createdAt: toIsoString(row.created_at),
  };
}

type QueryFn = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export class AgentDecisionRepository {
  constructor(private readonly queryFn: QueryFn = query) {}

  async listBySession(sessionId: string): Promise<AgentDecision[]> {
    const result = await this.queryFn<AgentDecisionRow>(
      "SELECT * FROM agent_decisions WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    );

    return result.rows.map(mapRow);
  }

  async getById(id: string): Promise<AgentDecision | null> {
    const result = await this.queryFn<AgentDecisionRow>(
      "SELECT * FROM agent_decisions WHERE id = $1 LIMIT 1",
      [id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(decision: AgentDecision): Promise<AgentDecision | null> {
    const result = await this.queryFn<AgentDecisionRow>(
      `INSERT INTO agent_decisions (
        id, session_id, agent_id, decision, reasoning, confidence,
        alternatives, recommendations, expected_outcome
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        decision.id,
        decision.sessionId,
        decision.agentId,
        decision.decision,
        decision.reasoning,
        decision.confidence,
        decision.alternatives,
        decision.recommendations,
        decision.expectedOutcome,
      ]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}
