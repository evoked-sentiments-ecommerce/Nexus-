import type { Package } from "../../entities/Package";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString, toJson, toNullableString, toStringArray } from "./helpers";

type PackageRow = {
  id: string;
  project_id: string;
  objective_id: string | null;
  package_name: string;
  package_type: Package["packageType"];
  included_documents: unknown;
  included_pdfs: unknown;
  included_assets: unknown;
  status: Package["status"];
  download_url: string | null;
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: PackageRow): Package => ({
  id: row.id,
  projectId: row.project_id,
  objectiveId: toNullableString(row.objective_id),
  packageName: row.package_name,
  packageType: row.package_type,
  includedDocuments: toStringArray(row.included_documents),
  includedPDFs: toStringArray(row.included_pdfs),
  includedAssets: toStringArray(row.included_assets),
  status: row.status,
  downloadUrl: toNullableString(row.download_url),
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class PackageRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<Package[]> {
    const result = await this.db.query<PackageRow>("SELECT * FROM packages ORDER BY created_at DESC");
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Package | null> {
    const result = await this.db.query<PackageRow>("SELECT * FROM packages WHERE id = $1", [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(pkg: Package): Promise<Package> {
    const result = await this.db.query<PackageRow>(
      `INSERT INTO packages
      (id, project_id, objective_id, package_name, package_type, included_documents, included_pdfs, included_assets, status, download_url, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        pkg.id,
        pkg.projectId,
        pkg.objectiveId,
        pkg.packageName,
        pkg.packageType,
        toJson(pkg.includedDocuments),
        toJson(pkg.includedPDFs),
        toJson(pkg.includedAssets),
        pkg.status,
        pkg.downloadUrl,
        pkg.ownerId,
        pkg.createdAt,
        pkg.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(pkg: Package): Promise<Package | null> {
    const result = await this.db.query<PackageRow>(
      `UPDATE packages
       SET project_id = $2,
           objective_id = $3,
           package_name = $4,
           package_type = $5,
           included_documents = $6::jsonb,
           included_pdfs = $7::jsonb,
           included_assets = $8::jsonb,
           status = $9,
           download_url = $10,
           owner_id = $11,
           updated_at = $12
       WHERE id = $1
       RETURNING *`,
      [
        pkg.id,
        pkg.projectId,
        pkg.objectiveId,
        pkg.packageName,
        pkg.packageType,
        toJson(pkg.includedDocuments),
        toJson(pkg.includedPDFs),
        toJson(pkg.includedAssets),
        pkg.status,
        pkg.downloadUrl,
        pkg.ownerId,
        pkg.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM packages WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
