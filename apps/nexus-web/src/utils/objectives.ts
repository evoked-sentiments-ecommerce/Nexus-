// ---------------------------------------------------------------------------
// Objective utilities — shared logic for the Nexus web objective system
// ---------------------------------------------------------------------------

export type ObjectivePriority = "low" | "medium" | "high" | "critical";
export type ObjectiveStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Objective {
  id: string;
  title: string;
  description?: string;
  priority: ObjectivePriority;
  status: ObjectiveStatus;
  projectId: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  priority?: ObjectivePriority;
  projectId: string;
  dueDate?: Date;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateCreateObjective(
  input: Partial<CreateObjectiveInput>
): string[] {
  const errors: string[] = [];
  if (!input.title || input.title.trim() === "") {
    errors.push("title is required");
  }
  if (input.title && input.title.trim().length > 200) {
    errors.push("title must be 200 characters or fewer");
  }
  if (!input.projectId || input.projectId.trim() === "") {
    errors.push("projectId is required");
  }
  if (
    input.priority !== undefined &&
    !["low", "medium", "high", "critical"].includes(input.priority)
  ) {
    errors.push("priority must be one of: low, medium, high, critical");
  }
  if (input.dueDate !== undefined && isNaN(input.dueDate.getTime())) {
    errors.push("dueDate must be a valid date");
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Filtering & sorting
// ---------------------------------------------------------------------------

export function filterObjectivesByStatus(
  objectives: Objective[],
  status: ObjectiveStatus
): Objective[] {
  return objectives.filter((o) => o.status === status);
}

export function filterObjectivesByPriority(
  objectives: Objective[],
  priority: ObjectivePriority
): Objective[] {
  return objectives.filter((o) => o.priority === priority);
}

export function sortObjectivesByPriority(objectives: Objective[]): Objective[] {
  const order: Record<ObjectivePriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...objectives].sort((a, b) => order[a.priority] - order[b.priority]);
}

export function getOverdueObjectives(objectives: Objective[]): Objective[] {
  const now = new Date();
  return objectives.filter(
    (o) =>
      o.dueDate !== undefined &&
      o.dueDate < now &&
      o.status !== "completed" &&
      o.status !== "cancelled"
  );
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatObjectiveStatus(status: ObjectiveStatus): string {
  const labels: Record<ObjectiveStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function formatObjectivePriority(priority: ObjectivePriority): string {
  const labels: Record<ObjectivePriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };
  return labels[priority];
}

// ---------------------------------------------------------------------------
// Progress calculation
// ---------------------------------------------------------------------------

export interface ObjectiveProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  percentComplete: number;
}

export function calculateObjectiveProgress(
  objectives: Objective[]
): ObjectiveProgress {
  const total = objectives.length;
  const completed = objectives.filter((o) => o.status === "completed").length;
  const inProgress = objectives.filter((o) => o.status === "in_progress").length;
  const pending = objectives.filter((o) => o.status === "pending").length;
  const cancelled = objectives.filter((o) => o.status === "cancelled").length;
  const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, inProgress, pending, cancelled, percentComplete };
}
