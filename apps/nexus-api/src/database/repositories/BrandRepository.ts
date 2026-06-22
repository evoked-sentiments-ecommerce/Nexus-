import type { Brand, ColorSwatch, TypographySpec } from "../../entities/Brand";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString, toJson, toNullableString, toObjectArray, toStringArray } from "./helpers";

type BrandRow = {
  id: string;
  project_id: string;
  objective_id: string | null;
  research_item_ids: unknown;
  name: string;
  tagline: string;
  mission: string;
  vision: string;
  positioning: string;
  target_audience: string;
  brand_voice: string;
  personality: unknown;
  core_values: unknown;
  color_palette: unknown;
  typography: unknown;
  status: Brand["status"];
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: BrandRow): Brand => ({
  id: row.id,
  projectId: row.project_id,
  objectiveId: toNullableString(row.objective_id),
  researchItemIds: toStringArray(row.research_item_ids),
  name: row.name,
  tagline: row.tagline,
  mission: row.mission,
  vision: row.vision,
  positioning: row.positioning,
  targetAudience: row.target_audience,
  brandVoice: row.brand_voice,
  personality: toStringArray(row.personality),
  coreValues: toStringArray(row.core_values),
  colorPalette: toObjectArray<ColorSwatch>(row.color_palette),
  typography: toObjectArray<TypographySpec>(row.typography),
  status: row.status,
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class BrandRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<Brand[]> {
    const result = await this.db.query<BrandRow>("SELECT * FROM brands ORDER BY created_at DESC");
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Brand | null> {
    const result = await this.db.query<BrandRow>("SELECT * FROM brands WHERE id = $1", [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(brand: Brand): Promise<Brand> {
    const result = await this.db.query<BrandRow>(
      `INSERT INTO brands
      (id, project_id, objective_id, research_item_ids, name, tagline, mission, vision, positioning, target_audience, brand_voice, personality, core_values, color_palette, typography, status, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17, $18, $19)
      RETURNING *`,
      [
        brand.id,
        brand.projectId,
        brand.objectiveId,
        toJson(brand.researchItemIds),
        brand.name,
        brand.tagline,
        brand.mission,
        brand.vision,
        brand.positioning,
        brand.targetAudience,
        brand.brandVoice,
        toJson(brand.personality),
        toJson(brand.coreValues),
        toJson(brand.colorPalette),
        toJson(brand.typography),
        brand.status,
        brand.ownerId,
        brand.createdAt,
        brand.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(brand: Brand): Promise<Brand | null> {
    const result = await this.db.query<BrandRow>(
      `UPDATE brands
       SET project_id = $2,
           objective_id = $3,
           research_item_ids = $4::jsonb,
           name = $5,
           tagline = $6,
           mission = $7,
           vision = $8,
           positioning = $9,
           target_audience = $10,
           brand_voice = $11,
           personality = $12::jsonb,
           core_values = $13::jsonb,
           color_palette = $14::jsonb,
           typography = $15::jsonb,
           status = $16,
           owner_id = $17,
           updated_at = $18
       WHERE id = $1
       RETURNING *`,
      [
        brand.id,
        brand.projectId,
        brand.objectiveId,
        toJson(brand.researchItemIds),
        brand.name,
        brand.tagline,
        brand.mission,
        brand.vision,
        brand.positioning,
        brand.targetAudience,
        brand.brandVoice,
        toJson(brand.personality),
        toJson(brand.coreValues),
        toJson(brand.colorPalette),
        toJson(brand.typography),
        brand.status,
        brand.ownerId,
        brand.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM brands WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
