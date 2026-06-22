import { QueryResult, query } from "../connection";
import { Goal } from "../../entities/Goal";

interface GoalRow {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  industry: string | null;
  priority: string;
  status: string;
  target_date: unknown;
  success_criteria: string[] | null;
  estimated_impact: string | null;
  estimated_value: number | null;
  created_by: string | null;
  created_at: unknown;
  updated_at: unknown;
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

function mapRow(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    goalType: row.goal_type as Goal["goalType"],
    industry: row.industry,
    priority: row.priority as Goal["priority"],
    status: row.status as Goal["status"],
    targetDate: toNullableIsoString(row.target_date),
    successCriteria: row.success_criteria ?? [],
    estimatedImpact: row.estimated_impact,
    estimatedValue: row.estimated_value,
    createdBy: row.created_by,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

type QueryFn = <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) => Promise<QueryResult<T>>;

export class GoalRepository {
  constructor(private readonly queryFn: QueryFn = query) {}

  async list(filter?: { goalType?: string; status?: string }): Promise<Goal[]> {
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (filter?.goalType) {
      values.push(filter.goalType);
      clauses.push(`goal_type = $${values.length}`);
    }

    if (filter?.status) {
      values.push(filter.status);
      clauses.push(`status = $${values.length}`);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.queryFn<GoalRow>(
      `SELECT * FROM goals ${where} ORDER BY created_at DESC`,
      values
    );

    return result.rows.map(mapRow);
  }

  async getById(id: string): Promise<Goal | null> {
    const result = await this.queryFn<GoalRow>(
      "SELECT * FROM goals WHERE id = $1 LIMIT 1",
      [id]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(goal: Goal): Promise<Goal | null> {
    const result = await this.queryFn<GoalRow>(
      `INSERT INTO goals (
        id, title, description, goal_type, industry, priority, status, target_date,
        success_criteria, estimated_impact, estimated_value, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        goal.id,
        goal.title,
        goal.description,
        goal.goalType,
        goal.industry,
        goal.priority,
        goal.status,
        goal.targetDate,
        goal.successCriteria,
        goal.estimatedImpact,
        goal.estimatedValue,
        goal.createdBy,
      ]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async update(
    id: string,
    input: Partial<
      Pick<
        Goal,
        | "title"
        | "description"
        | "goalType"
        | "industry"
        | "priority"
        | "status"
        | "targetDate"
        | "successCriteria"
        | "estimatedImpact"
        | "estimatedValue"
      >
    >
  ): Promise<Goal | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const pushField = (column: string, value: unknown): void => {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    };

    pushField("title", input.title);
    pushField("description", input.description);
    pushField("goal_type", input.goalType);
    pushField("industry", input.industry);
    pushField("priority", input.priority);
    pushField("status", input.status);
    pushField("target_date", input.targetDate);
    pushField("success_criteria", input.successCriteria);
    pushField("estimated_impact", input.estimatedImpact);
    pushField("estimated_value", input.estimatedValue);

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);

    const result = await this.queryFn<GoalRow>(
      `UPDATE goals SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.queryFn("DELETE FROM goals WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
