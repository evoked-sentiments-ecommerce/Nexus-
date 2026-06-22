// ---------------------------------------------------------------------------
// Project utilities — shared logic for the Nexus web project system
// ---------------------------------------------------------------------------

export type ProjectStatus = "active" | "archived" | "draft";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  tags?: string[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  ownerId: string;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateCreateProject(input: Partial<CreateProjectInput>): string[] {
  const errors: string[] = [];
  if (!input.name || input.name.trim() === "") {
    errors.push("name is required");
  }
  if (input.name && input.name.trim().length > 120) {
    errors.push("name must be 120 characters or fewer");
  }
  if (!input.ownerId || input.ownerId.trim() === "") {
    errors.push("ownerId is required");
  }
  if (
    input.status !== undefined &&
    !["active", "archived", "draft"].includes(input.status)
  ) {
    errors.push("status must be one of: active, archived, draft");
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Filtering & sorting
// ---------------------------------------------------------------------------

export function filterProjectsByStatus(
  projects: Project[],
  status: ProjectStatus
): Project[] {
  return projects.filter((p) => p.status === status);
}

export function sortProjectsByDate(
  projects: Project[],
  direction: "asc" | "desc" = "desc"
): Project[] {
  return [...projects].sort((a, b) => {
    const diff = a.updatedAt.getTime() - b.updatedAt.getTime();
    return direction === "asc" ? diff : -diff;
  });
}

export function searchProjects(projects: Project[], query: string): Project[] {
  const q = query.toLowerCase().trim();
  if (!q) return projects;
  return projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatProjectStatus(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    active: "Active",
    archived: "Archived",
    draft: "Draft",
  };
  return labels[status];
}

export function getProjectInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
