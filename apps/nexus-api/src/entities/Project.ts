export type ProjectStatus = "planned" | "active" | "blocked" | "completed";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  ownerId: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
}
