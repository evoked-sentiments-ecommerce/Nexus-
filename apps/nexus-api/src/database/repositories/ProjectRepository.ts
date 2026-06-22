import type { Project } from "../../entities/Project";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString } from "./helpers";

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  status: Project["status"];
  priority: Project["priority"];
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: ProjectRow): Project => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  priority: row.priority,
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class ProjectRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<Project[]> {
    const result = await this.db.query<ProjectRow>("SELECT * FROM projects ORDER BY created_at DESC");
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Project | null> {
    const result = await this.db.query<ProjectRow>("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(project: Project): Promise<Project> {
    const result = await this.db.query<ProjectRow>(
      `INSERT INTO projects (id, title, description, status, priority, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        project.id,
        project.title,
        project.description,
        project.status,
        project.priority,
        project.ownerId,
        project.createdAt,
        project.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(project: Project): Promise<Project | null> {
    const result = await this.db.query<ProjectRow>(
      `UPDATE projects
       SET title = $2, description = $3, status = $4, priority = $5, owner_id = $6, updated_at = $7
       WHERE id = $1
       RETURNING *`,
      [
        project.id,
        project.title,
        project.description,
        project.status,
        project.priority,
        project.ownerId,
        project.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM projects WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
