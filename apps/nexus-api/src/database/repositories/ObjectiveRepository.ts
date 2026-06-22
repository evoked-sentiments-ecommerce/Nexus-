import type { Objective } from "../../entities/Objective";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString, toNullableIsoString } from "./helpers";

type ObjectiveRow = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: Objective["status"];
  progress: number;
  target_date: string | Date | null;
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: ObjectiveRow): Objective => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  description: row.description,
  status: row.status,
  progress: row.progress,
  targetDate: toNullableIsoString(row.target_date),
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class ObjectiveRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<Objective[]> {
    const result = await this.db.query<ObjectiveRow>(
      "SELECT * FROM objectives ORDER BY created_at DESC",
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Objective | null> {
    const result = await this.db.query<ObjectiveRow>("SELECT * FROM objectives WHERE id = $1", [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(objective: Objective): Promise<Objective> {
    const result = await this.db.query<ObjectiveRow>(
      `INSERT INTO objectives
      (id, project_id, title, description, status, progress, target_date, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        objective.id,
        objective.projectId,
        objective.title,
        objective.description,
        objective.status,
        objective.progress,
        objective.targetDate,
        objective.ownerId,
        objective.createdAt,
        objective.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(objective: Objective): Promise<Objective | null> {
    const result = await this.db.query<ObjectiveRow>(
      `UPDATE objectives
       SET project_id = $2,
           title = $3,
           description = $4,
           status = $5,
           progress = $6,
           target_date = $7,
           owner_id = $8,
           updated_at = $9
       WHERE id = $1
       RETURNING *`,
      [
        objective.id,
        objective.projectId,
        objective.title,
        objective.description,
        objective.status,
        objective.progress,
        objective.targetDate,
        objective.ownerId,
        objective.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM objectives WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
