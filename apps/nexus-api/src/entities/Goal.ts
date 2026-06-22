export const GOAL_TYPES = [
  "Business Goal",
  "Hospitality Goal",
  "Technology Goal",
  "Marketing Goal",
  "Financial Goal",
  "HR Goal",
  "Operations Goal",
  "Research Goal",
  "Custom Goal",
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];

export type GoalPriority = "low" | "medium" | "high" | "critical";

export type GoalStatus =
  | "draft"
  | "analyzing"
  | "planned"
  | "in_progress"
  | "blocked"
  | "completed"
  | "cancelled";

export interface Goal {
  id: string;
  title: string;
  description: string;
  goalType: GoalType;
  industry: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  targetDate: string | null;
  successCriteria: string[];
  estimatedImpact: string | null;
  estimatedValue: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
}

export interface GoalDeliverable {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface GoalDecomposition {
  goalId: string;
  analysis: string[];
  requirements: string[];
  missingInformation: string[];
  objectives: string[];
  projects: string[];
  researchRequirements: string[];
  productionRequirements: string[];
  executionPlan: string[];
  dependencies: string[];
  milestones: GoalMilestone[];
  deliverables: GoalDeliverable[];
  generatedAt: string;
}

export function parseGoalType(value: unknown): GoalType {
  if (typeof value === "string" && GOAL_TYPES.includes(value as GoalType)) {
    return value as GoalType;
  }
  return "Custom Goal";
}
