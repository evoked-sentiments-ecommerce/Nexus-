// ---------------------------------------------------------------------------
// Chef Drew Utilities — types and helpers for hospitality features
// ---------------------------------------------------------------------------

export type HospitalityDomain =
  | "restaurant"
  | "hotel"
  | "resort"
  | "private_club"
  | "luxury_destination"
  | "culinary_operations"
  | "hospitality_finance"
  | "training"
  | "guest_experience";

export type BlueprintStatus = "pending" | "generating" | "ready" | "failed";

export interface HospitalityObjective {
  id?: string;
  operationName: string;
  domain: HospitalityDomain;
  description: string;
  cuisineStyle?: string;
  coversPerDay?: number;
  avgSpend?: number;
  teamSize?: number;
  location?: string;
  objectives?: string[];
}

export interface BlueprintSummary {
  blueprintId: string;
  operationName: string;
  domain: HospitalityDomain;
  status: BlueprintStatus;
  concept?: string;
  pdfUrl?: string;
  generatedAt: string;
}

export interface MenuSummary {
  menuId: string;
  name: string;
  sectionCount: number;
  totalItems: number;
  avgFoodCostPct: number;
  highlights: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateHospitalityObjective(
  input: Partial<HospitalityObjective>
): ValidationResult {
  const errors: string[] = [];

  if (!input.operationName || input.operationName.trim().length === 0) {
    errors.push("operationName is required");
  }
  if (!input.domain) {
    errors.push("domain is required");
  }
  if (!input.description || input.description.trim().length === 0) {
    errors.push("description is required");
  }
  if (input.coversPerDay !== undefined && input.coversPerDay < 0) {
    errors.push("coversPerDay must be non-negative");
  }
  if (input.avgSpend !== undefined && input.avgSpend < 0) {
    errors.push("avgSpend must be non-negative");
  }
  if (input.teamSize !== undefined && input.teamSize < 0) {
    errors.push("teamSize must be non-negative");
  }

  return { valid: errors.length === 0, errors };
}

const STATUS_LABELS: Record<BlueprintStatus, string> = {
  pending: "Pending",
  generating: "Generating…",
  ready: "Ready",
  failed: "Failed",
};

export function formatBlueprintStatus(status: BlueprintStatus): string {
  return STATUS_LABELS[status] ?? status;
}

const DOMAIN_LABELS: Record<HospitalityDomain, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  resort: "Resort",
  private_club: "Private Members Club",
  luxury_destination: "Luxury Destination",
  culinary_operations: "Culinary Operations",
  hospitality_finance: "Hospitality Finance",
  training: "Training Programme",
  guest_experience: "Guest Experience",
};

export function getBlueprintDomainLabel(domain: HospitalityDomain): string {
  return DOMAIN_LABELS[domain] ?? domain;
}
