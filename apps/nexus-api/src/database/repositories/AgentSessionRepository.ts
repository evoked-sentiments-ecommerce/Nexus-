import { QueryResult, query } from "../connection";
import {
  AgentSession,
  AgentSessionStatus,
  SharedAgentContext,
  createEmptySharedAgentContext,
} from "../../entities/AgentSession";

interface AgentSessionRow {
  id: string;
  goal: string;
  objective: string | null;
  status: AgentSessionStatus;
  participating_agent_ids: string[] | null;
  shared_context: SharedAgentContext | null;
  unified_execution_plan: string[] | null;
  merged_outputs: Record<string, unknown> | null;
  created_by: string | null;
  created_at: unknown;
  updated_at: unknown;
  completed_at: unknown;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function toNullableIsoString(value: unknown): string | null {
  if (value == null) return null;
  return toIsoString(value);
}

function mapRow(row: AgentSessionRow): AgentSession {
  return {
    id: row.id,
    goal: row.goal,
    objective: row.objective,
    status: row.status,
    participatingAgentIds: (row.participating_agent_ids ?? []) as AgentSession["participatingAgentIds"],
    sharedContext: row.shared_context ?? createEmptySharedAgentContext(),
    unifiedExecutionPlan: row.unified_execution_plan ?? [],
    mergedOutputs: row.merged_outputs ?? {},
    createdBy: row.created_by,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    completedAt: toNullableIsoString(row.completed_at),
  };
}

type QueryFn = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export class AgentSessionRepository {
  constructor(private readonly queryFn: QueryFn = query) {}

  async list(filter?: { status?: AgentSessionStatus }): Promise<AgentSession[]> {
    const values: unknown[] = [];
    const where = filter?.status ? "WHERE status = $1" : "";
    if (filter?.status) {
      values.push(filter.status);
    }

    const result = await this.queryFn<AgentSessionRow>(
      `SELECT * FROM agent_sessions ${where} ORDER BY created_at DESC`,
      values
    );

    return result.rows.map(mapRow);
  }

  async getById(id: string): Promise<AgentSession | null> {
    const result = await this.queryFn<AgentSessionRow>(
      "SELECT * FROM agent_sessions WHERE id = $1 LIMIT 1",
      [id]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(session: AgentSession): Promise<AgentSession | null> {
    const result = await this.queryFn<AgentSessionRow>(
      `INSERT INTO agent_sessions (
        id, goal, objective, status, participating_agent_ids, shared_context,
        unified_execution_plan, merged_outputs, created_by, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        session.id,
        session.goal,
        session.objective,
        session.status,
        session.participatingAgentIds,
        session.sharedContext,
        session.unifiedExecutionPlan,
        session.mergedOutputs,
        session.createdBy,
        session.completedAt,
      ]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async update(
    id: string,
    input: Partial<
      Pick<
        AgentSession,
        "goal" | "objective" | "status" | "participatingAgentIds" | "sharedContext" | "unifiedExecutionPlan" | "mergedOutputs" | "completedAt"
      >
    >
  ): Promise<AgentSession | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown): void => {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    };

    pushField("goal", input.goal);
    pushField("objective", input.objective);
    pushField("status", input.status);
    pushField("participating_agent_ids", input.participatingAgentIds);
    pushField("shared_context", input.sharedContext);
    pushField("unified_execution_plan", input.unifiedExecutionPlan);
    pushField("merged_outputs", input.mergedOutputs);
    pushField("completed_at", input.completedAt);

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);

    const result = await this.queryFn<AgentSessionRow>(
      `UPDATE agent_sessions SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}
