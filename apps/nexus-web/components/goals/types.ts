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
  industry?: string | null;
  priority: GoalPriority;
  status: GoalStatus;
  targetDate?: string | null;
  successCriteria: string[];
  estimatedImpact?: string | null;
  estimatedValue?: number | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed";
}

export function formatGoalStatus(status: GoalStatus): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatGoalPriority(priority: GoalPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
