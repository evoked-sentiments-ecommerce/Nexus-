import {
  type BlueprintFeature,
  type BlueprintStatus,
  type BlueprintType,
  type HospitalityBlueprint,
} from "../entities/HospitalityBlueprint";
import { type Job, type JobHandler, queue } from "../queue/queue";

export type BlueprintJobPayload = {
  blueprintId: string;
  projectId: string;
  title: string;
  blueprintType: BlueprintType;
  features: BlueprintFeature[];
  conceptNotes: string;
  menuEngineering: string;
  revenueStrategy: string;
  operationsFramework: string;
  foodCostTarget: number | null;
  laborCostTarget: number | null;
};

export type BlueprintJobResult = {
  blueprintId: string;
  status: BlueprintStatus;
  generatedSections: Record<string, string>;
  processedAt: string;
};

const FEATURE_SECTION_LABELS: Record<BlueprintFeature, string> = {
  concept_development: "Concept Development",
  menu_engineering: "Menu Engineering",
  food_cost_models: "Food Cost Models",
  labor_models: "Labor Models",
  sop_generation: "SOP Generation",
  training_program_generation: "Training Program Generation",
  revenue_strategy: "Revenue Strategy",
  hospitality_operations_framework: "Hospitality Operations Framework",
};

const BLUEPRINT_TYPE_LABELS: Record<BlueprintType, string> = {
  restaurant: "Restaurant",
  hotel_fb: "Hotel F&B",
  resort: "Resort",
  private_club: "Private Club",
  catering: "Catering",
  executive_advisory: "Executive Advisory",
};

const generateBlueprintSections = (
  payload: BlueprintJobPayload,
): Record<string, string> => {
  const typeLabel = BLUEPRINT_TYPE_LABELS[payload.blueprintType];
  const sections: Record<string, string> = {
    overview: `${typeLabel} blueprint: ${payload.title}. Project: ${payload.projectId}.`,
  };

  for (const feature of payload.features) {
    const label = FEATURE_SECTION_LABELS[feature];

    if (feature === "concept_development" && payload.conceptNotes) {
      sections[feature] = `${label}: ${payload.conceptNotes}`;
    } else if (feature === "menu_engineering" && payload.menuEngineering) {
      sections[feature] = `${label}: ${payload.menuEngineering}`;
    } else if (feature === "revenue_strategy" && payload.revenueStrategy) {
      sections[feature] = `${label}: ${payload.revenueStrategy}`;
    } else if (
      feature === "hospitality_operations_framework" &&
      payload.operationsFramework
    ) {
      sections[feature] = `${label}: ${payload.operationsFramework}`;
    } else if (feature === "food_cost_models" && payload.foodCostTarget !== null) {
      sections[feature] = `${label}: Target ${payload.foodCostTarget}%`;
    } else if (feature === "labor_models" && payload.laborCostTarget !== null) {
      sections[feature] = `${label}: Target ${payload.laborCostTarget}%`;
    } else {
      sections[feature] = `${label}: Generated for ${typeLabel}`;
    }
  }

  return sections;
};

const blueprintJobHandler: JobHandler<BlueprintJobPayload, BlueprintJobResult> = async (
  job: Job<BlueprintJobPayload, BlueprintJobResult>,
): Promise<BlueprintJobResult> => {
  const payload = job.payload;
  const generatedSections = generateBlueprintSections(payload);

  return {
    blueprintId: payload.blueprintId,
    status: "approved",
    generatedSections,
    processedAt: new Date().toISOString(),
  };
};

queue.register<BlueprintJobPayload, BlueprintJobResult>("blueprint", blueprintJobHandler);

export const enqueueBlueprintJob = (
  payload: BlueprintJobPayload,
  options: { maxAttempts?: number } = {},
): Job<BlueprintJobPayload> => {
  return queue.enqueue<BlueprintJobPayload>("blueprint", payload, options);
};

export type { HospitalityBlueprint };
