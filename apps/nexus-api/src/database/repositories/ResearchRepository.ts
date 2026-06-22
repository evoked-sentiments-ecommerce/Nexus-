import type { ResearchItem } from "../../entities/ResearchItem";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString, toJson, toNullableString, toObjectArray, toStringArray } from "./helpers";

type ResearchRow = {
  id: string;
  project_id: string;
  objective_id: string | null;
  type: ResearchItem["type"];
  status: ResearchItem["status"];
  title: string;
  notes: string;
  sources: unknown;
  findings: unknown;
  tags: unknown;
  attachments: unknown;
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: ResearchRow): ResearchItem => ({
  id: row.id,
  projectId: row.project_id,
  objectiveId: toNullableString(row.objective_id),
  type: row.type,
  status: row.status,
  title: row.title,
  notes: row.notes,
  sources: toStringArray(row.sources),
  findings: toStringArray(row.findings),
  tags: toStringArray(row.tags),
  attachments: toStringArray(row.attachments),
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class ResearchRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<ResearchItem[]> {
    const result = await this.db.query<ResearchRow>(
      "SELECT * FROM research_items ORDER BY created_at DESC",
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<ResearchItem | null> {
    const result = await this.db.query<ResearchRow>(
      "SELECT * FROM research_items WHERE id = $1",
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(item: ResearchItem): Promise<ResearchItem> {
    const result = await this.db.query<ResearchRow>(
      `INSERT INTO research_items
      (id, project_id, objective_id, type, status, title, notes, sources, findings, tags, attachments, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12, $13, $14)
      RETURNING *`,
      [
        item.id,
        item.projectId,
        item.objectiveId,
        item.type,
        item.status,
        item.title,
        item.notes,
        toJson(item.sources),
        toJson(item.findings),
        toJson(item.tags),
        toJson(item.attachments),
        item.ownerId,
        item.createdAt,
        item.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(item: ResearchItem): Promise<ResearchItem | null> {
    const result = await this.db.query<ResearchRow>(
      `UPDATE research_items
       SET project_id = $2,
           objective_id = $3,
           type = $4,
           status = $5,
           title = $6,
           notes = $7,
           sources = $8::jsonb,
           findings = $9::jsonb,
           tags = $10::jsonb,
           attachments = $11::jsonb,
           owner_id = $12,
           updated_at = $13
       WHERE id = $1
       RETURNING *`,
      [
        item.id,
        item.projectId,
        item.objectiveId,
        item.type,
        item.status,
        item.title,
        item.notes,
        toJson(item.sources),
        toJson(item.findings),
        toJson(item.tags),
        toJson(item.attachments),
        item.ownerId,
        item.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM research_items WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
