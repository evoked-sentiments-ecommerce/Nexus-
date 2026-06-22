"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalRepository = void 0;
const connection_1 = require("../connection");
function toIsoString(value) {
    if (value instanceof Date)
        return value.toISOString();
    if (typeof value === "string")
        return value;
    return new Date().toISOString();
}
function toNullableIsoString(value) {
    if (value == null)
        return null;
    return toIsoString(value);
}
function mapRow(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        goalType: row.goal_type,
        industry: row.industry,
        priority: row.priority,
        status: row.status,
        targetDate: toNullableIsoString(row.target_date),
        successCriteria: row.success_criteria ?? [],
        estimatedImpact: row.estimated_impact,
        estimatedValue: row.estimated_value,
        createdBy: row.created_by,
        createdAt: toIsoString(row.created_at),
        updatedAt: toIsoString(row.updated_at),
    };
}
class GoalRepository {
    constructor(queryFn = connection_1.query) {
        this.queryFn = queryFn;
    }
    async list(filter) {
        const clauses = [];
        const values = [];
        if (filter?.goalType) {
            values.push(filter.goalType);
            clauses.push(`goal_type = $${values.length}`);
        }
        if (filter?.status) {
            values.push(filter.status);
            clauses.push(`status = $${values.length}`);
        }
        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
        const result = await this.queryFn(`SELECT * FROM goals ${where} ORDER BY created_at DESC`, values);
        return result.rows.map(mapRow);
    }
    async getById(id) {
        const result = await this.queryFn("SELECT * FROM goals WHERE id = $1 LIMIT 1", [id]);
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }
    async create(goal) {
        const result = await this.queryFn(`INSERT INTO goals (
        id, title, description, goal_type, industry, priority, status, target_date,
        success_criteria, estimated_impact, estimated_value, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`, [
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
        ]);
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }
    async update(id, input) {
        const fields = [];
        const values = [];
        const pushField = (column, value) => {
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
        const result = await this.queryFn(`UPDATE goals SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`, values);
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }
    async delete(id) {
        const result = await this.queryFn("DELETE FROM goals WHERE id = $1", [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
exports.GoalRepository = GoalRepository;
//# sourceMappingURL=GoalRepository.js.map