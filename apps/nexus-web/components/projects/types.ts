export type ProjectStatus = "planned" | "active" | "blocked" | "completed";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
