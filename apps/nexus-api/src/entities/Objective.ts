export type ObjectiveStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked";

export interface Objective {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: ObjectiveStatus;
  progress: number;
  targetDate: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateObjectiveInput {
  projectId: string;
  title: string;
  description?: string;
  status?: ObjectiveStatus;
  progress?: number;
  targetDate?: string | null;
  ownerId: string;
}

export interface UpdateObjectiveInput {
  title?: string;
  description?: string;
  status?: ObjectiveStatus;
  progress?: number;
  targetDate?: string | null;
}
