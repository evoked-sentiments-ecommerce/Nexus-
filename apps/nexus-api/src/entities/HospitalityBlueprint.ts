export type BlueprintType =
  | "restaurant"
  | "hotel_fb"
  | "resort"
  | "private_club"
  | "catering"
  | "executive_advisory";

export type BlueprintFeature =
  | "concept_development"
  | "menu_engineering"
  | "food_cost_models"
  | "labor_models"
  | "sop_generation"
  | "training_program_generation"
  | "revenue_strategy"
  | "hospitality_operations_framework";

export type BlueprintStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "active"
  | "archived";

export interface HospitalityBlueprint {
  id: string;
  projectId: string;
  objectiveId: string | null;
  researchItemIds: string[];
  brandIds: string[];
  documentIds: string[];
  pdfTemplateIds: string[];
  title: string;
  description: string;
  blueprintType: BlueprintType;
  features: BlueprintFeature[];
  conceptNotes: string;
  menuEngineering: string;
  foodCostTarget: number | null;
  laborCostTarget: number | null;
  revenueStrategy: string;
  operationsFramework: string;
  status: BlueprintStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHospitalityBlueprintInput {
  projectId: string;
  objectiveId?: string | null;
  researchItemIds?: string[];
  brandIds?: string[];
  documentIds?: string[];
  pdfTemplateIds?: string[];
  title: string;
  description?: string;
  blueprintType: BlueprintType;
  features?: BlueprintFeature[];
  conceptNotes?: string;
  menuEngineering?: string;
  foodCostTarget?: number | null;
  laborCostTarget?: number | null;
  revenueStrategy?: string;
  operationsFramework?: string;
  status?: BlueprintStatus;
  ownerId: string;
}

export interface UpdateHospitalityBlueprintInput {
  title?: string;
  description?: string;
  blueprintType?: BlueprintType;
  features?: BlueprintFeature[];
  conceptNotes?: string;
  menuEngineering?: string;
  foodCostTarget?: number | null;
  laborCostTarget?: number | null;
  revenueStrategy?: string;
  operationsFramework?: string;
  status?: BlueprintStatus;
  objectiveId?: string | null;
  researchItemIds?: string[];
  brandIds?: string[];
  documentIds?: string[];
  pdfTemplateIds?: string[];
}
