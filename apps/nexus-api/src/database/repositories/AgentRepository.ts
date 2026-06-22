import { Agent, AgentKey, AgentPerformance, AgentStatus } from "../../entities/Agent";
import { QueryResult, query } from "../connection";

interface AgentRow {
  id: string;
  key: AgentKey;
  name: string;
  domain: string;
  specialty: string;
  status: AgentStatus;
  capabilities: string[] | null;
  collaboration_targets: AgentKey[] | null;
  performance: AgentPerformance | null;
  metadata: Record<string, unknown> | null;
  created_at: unknown;
  updated_at: unknown;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function mapRow(row: AgentRow): Agent {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    domain: row.domain,
    specialty: row.specialty,
    status: row.status,
    capabilities: row.capabilities ?? [],
    collaborationTargets: row.collaboration_targets ?? [],
    performance: row.performance ?? {
      accuracy: 0,
      effectiveness: 0,
      contribution: 0,
      collaborationQuality: 0,
    },
    metadata: row.metadata ?? {},
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

type QueryFn = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export class AgentRepository {
  constructor(private readonly queryFn: QueryFn = query) {}

  async list(filter?: { status?: AgentStatus; domain?: string }): Promise<Agent[]> {
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (filter?.status) {
      values.push(filter.status);
      clauses.push(`status = $${values.length}`);
    }

    if (filter?.domain) {
      values.push(filter.domain);
      clauses.push(`domain = $${values.length}`);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.queryFn<AgentRow>(
      `SELECT * FROM agents ${where} ORDER BY created_at DESC`,
      values
    );

    return result.rows.map(mapRow);
  }

  async getById(id: string): Promise<Agent | null> {
    const result = await this.queryFn<AgentRow>("SELECT * FROM agents WHERE id = $1 LIMIT 1", [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(agent: Agent): Promise<Agent | null> {
    const result = await this.queryFn<AgentRow>(
      `INSERT INTO agents (
        id, key, name, domain, specialty, status, capabilities, collaboration_targets,
        performance, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        agent.id,
        agent.key,
        agent.name,
        agent.domain,
        agent.specialty,
        agent.status,
        agent.capabilities,
        agent.collaborationTargets,
        agent.performance,
        agent.metadata,
      ]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async update(
    id: string,
    input: Partial<
      Pick<
        Agent,
        | "name"
        | "domain"
        | "specialty"
        | "status"
        | "capabilities"
        | "collaborationTargets"
        | "performance"
        | "metadata"
      >
    >
  ): Promise<Agent | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown): void => {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    };

    pushField("name", input.name);
    pushField("domain", input.domain);
    pushField("specialty", input.specialty);
    pushField("status", input.status);
    pushField("capabilities", input.capabilities);
    pushField("collaboration_targets", input.collaborationTargets);
    pushField("performance", input.performance);
    pushField("metadata", input.metadata);

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);

    const result = await this.queryFn<AgentRow>(
      `UPDATE agents SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}
