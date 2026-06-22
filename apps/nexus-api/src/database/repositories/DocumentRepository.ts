import type { Document } from "../../entities/Document";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString, toJson, toNullableString, toStringArray } from "./helpers";

type DocumentRow = {
  id: string;
  project_id: string;
  objective_id: string | null;
  brand_id: string | null;
  title: string;
  document_type: Document["documentType"];
  content: string;
  status: Document["status"];
  version: number;
  tags: unknown;
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: DocumentRow): Document => ({
  id: row.id,
  projectId: row.project_id,
  objectiveId: toNullableString(row.objective_id),
  brandId: toNullableString(row.brand_id),
  title: row.title,
  documentType: row.document_type,
  content: row.content,
  status: row.status,
  version: row.version,
  tags: toStringArray(row.tags),
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class DocumentRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<Document[]> {
    const result = await this.db.query<DocumentRow>(
      "SELECT * FROM documents ORDER BY created_at DESC",
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Document | null> {
    const result = await this.db.query<DocumentRow>("SELECT * FROM documents WHERE id = $1", [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(document: Document): Promise<Document> {
    const result = await this.db.query<DocumentRow>(
      `INSERT INTO documents
      (id, project_id, objective_id, brand_id, title, document_type, content, status, version, tags, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13)
      RETURNING *`,
      [
        document.id,
        document.projectId,
        document.objectiveId,
        document.brandId,
        document.title,
        document.documentType,
        document.content,
        document.status,
        document.version,
        toJson(document.tags),
        document.ownerId,
        document.createdAt,
        document.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(document: Document): Promise<Document | null> {
    const result = await this.db.query<DocumentRow>(
      `UPDATE documents
       SET project_id = $2,
           objective_id = $3,
           brand_id = $4,
           title = $5,
           document_type = $6,
           content = $7,
           status = $8,
           version = $9,
           tags = $10::jsonb,
           owner_id = $11,
           updated_at = $12
       WHERE id = $1
       RETURNING *`,
      [
        document.id,
        document.projectId,
        document.objectiveId,
        document.brandId,
        document.title,
        document.documentType,
        document.content,
        document.status,
        document.version,
        toJson(document.tags),
        document.ownerId,
        document.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM documents WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
