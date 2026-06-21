export type ObjectiveStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked";

export type Objective = {
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
};
