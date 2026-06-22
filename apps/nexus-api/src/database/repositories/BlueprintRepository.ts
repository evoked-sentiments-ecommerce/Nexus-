import type { BlueprintFeature, HospitalityBlueprint } from "../../entities/HospitalityBlueprint";
import { getPool, type QueryExecutor } from "../connection";
import {
  toIsoString,
  toJson,
  toNullableString,
  toNumberOrNull,
  toStringArray,
} from "./helpers";

type BlueprintRow = {
  id: string;
  project_id: string;
  objective_id: string | null;
  research_item_ids: unknown;
  brand_ids: unknown;
  document_ids: unknown;
  pdf_template_ids: unknown;
  title: string;
  description: string;
  blueprint_type: HospitalityBlueprint["blueprintType"];
  features: unknown;
  concept_notes: string;
  menu_engineering: string;
  food_cost_target: number | null;
  labor_cost_target: number | null;
  revenue_strategy: string;
  operations_framework: string;
  status: HospitalityBlueprint["status"];
  owner_id: string;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: BlueprintRow): HospitalityBlueprint => ({
  id: row.id,
  projectId: row.project_id,
  objectiveId: toNullableString(row.objective_id),
  researchItemIds: toStringArray(row.research_item_ids),
  brandIds: toStringArray(row.brand_ids),
  documentIds: toStringArray(row.document_ids),
  pdfTemplateIds: toStringArray(row.pdf_template_ids),
  title: row.title,
  description: row.description,
  blueprintType: row.blueprint_type,
  features: toStringArray(row.features) as BlueprintFeature[],
  conceptNotes: row.concept_notes,
  menuEngineering: row.menu_engineering,
  foodCostTarget: toNumberOrNull(row.food_cost_target),
  laborCostTarget: toNumberOrNull(row.labor_cost_target),
  revenueStrategy: row.revenue_strategy,
  operationsFramework: row.operations_framework,
  status: row.status,
  ownerId: row.owner_id,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class BlueprintRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findAll(): Promise<HospitalityBlueprint[]> {
    const result = await this.db.query<BlueprintRow>(
      "SELECT * FROM hospitality_blueprints ORDER BY created_at DESC",
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<HospitalityBlueprint | null> {
    const result = await this.db.query<BlueprintRow>(
      "SELECT * FROM hospitality_blueprints WHERE id = $1",
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(blueprint: HospitalityBlueprint): Promise<HospitalityBlueprint> {
    const result = await this.db.query<BlueprintRow>(
      `INSERT INTO hospitality_blueprints
      (id, project_id, objective_id, research_item_ids, brand_ids, document_ids, pdf_template_ids, title, description, blueprint_type, features, concept_notes, menu_engineering, food_cost_target, labor_cost_target, revenue_strategy, operations_framework, status, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        blueprint.id,
        blueprint.projectId,
        blueprint.objectiveId,
        toJson(blueprint.researchItemIds),
        toJson(blueprint.brandIds),
        toJson(blueprint.documentIds),
        toJson(blueprint.pdfTemplateIds),
        blueprint.title,
        blueprint.description,
        blueprint.blueprintType,
        toJson(blueprint.features),
        blueprint.conceptNotes,
        blueprint.menuEngineering,
        blueprint.foodCostTarget,
        blueprint.laborCostTarget,
        blueprint.revenueStrategy,
        blueprint.operationsFramework,
        blueprint.status,
        blueprint.ownerId,
        blueprint.createdAt,
        blueprint.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async update(blueprint: HospitalityBlueprint): Promise<HospitalityBlueprint | null> {
    const result = await this.db.query<BlueprintRow>(
      `UPDATE hospitality_blueprints
       SET project_id = $2,
           objective_id = $3,
           research_item_ids = $4::jsonb,
           brand_ids = $5::jsonb,
           document_ids = $6::jsonb,
           pdf_template_ids = $7::jsonb,
           title = $8,
           description = $9,
           blueprint_type = $10,
           features = $11::jsonb,
           concept_notes = $12,
           menu_engineering = $13,
           food_cost_target = $14,
           labor_cost_target = $15,
           revenue_strategy = $16,
           operations_framework = $17,
           status = $18,
           owner_id = $19,
           updated_at = $20
       WHERE id = $1
       RETURNING *`,
      [
        blueprint.id,
        blueprint.projectId,
        blueprint.objectiveId,
        toJson(blueprint.researchItemIds),
        toJson(blueprint.brandIds),
        toJson(blueprint.documentIds),
        toJson(blueprint.pdfTemplateIds),
        blueprint.title,
        blueprint.description,
        blueprint.blueprintType,
        toJson(blueprint.features),
        blueprint.conceptNotes,
        blueprint.menuEngineering,
        blueprint.foodCostTarget,
        blueprint.laborCostTarget,
        blueprint.revenueStrategy,
        blueprint.operationsFramework,
        blueprint.status,
        blueprint.ownerId,
        blueprint.updatedAt,
      ],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM hospitality_blueprints WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
