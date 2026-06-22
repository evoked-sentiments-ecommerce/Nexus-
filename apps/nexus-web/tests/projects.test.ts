/**
 * projects.test.ts
 *
 * Unit + Integration tests for the Nexus project system utilities.
 */

import {
  validateCreateProject,
  filterProjectsByStatus,
  sortProjectsByDate,
  searchProjects,
  formatProjectStatus,
  getProjectInitials,
  Project,
  ProjectStatus,
} from "../src/utils/projects";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj-001",
    name: "Restaurant Rebrand",
    description: "Full rebrand for the downtown location",
    status: "active",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-03-01T00:00:00Z"),
    ownerId: "user-001",
    tags: ["branding", "hospitality"],
    ...overrides,
  };
}

const projects: Project[] = [
  makeProject({ id: "p1", name: "Alpha", status: "active", updatedAt: new Date("2024-03-15") }),
  makeProject({ id: "p2", name: "Beta", status: "draft", updatedAt: new Date("2024-01-10") }),
  makeProject({ id: "p3", name: "Gamma", status: "archived", updatedAt: new Date("2024-02-20") }),
  makeProject({ id: "p4", name: "Delta Menu", status: "active", updatedAt: new Date("2024-04-01"), description: "Menu development", tags: ["menu"] }),
];

// ---------------------------------------------------------------------------
// Unit tests — validateCreateProject
// ---------------------------------------------------------------------------

describe("validateCreateProject — unit tests", () => {
  it("returns no errors for a valid input", () => {
    const errors = validateCreateProject({
      name: "New Project",
      ownerId: "user-123",
      status: "draft",
    });
    expect(errors).toHaveLength(0);
  });

  it("returns an error when name is missing", () => {
    const errors = validateCreateProject({ ownerId: "user-123" });
    expect(errors).toContain("name is required");
  });

  it("returns an error when name is an empty string", () => {
    const errors = validateCreateProject({ name: "  ", ownerId: "user-123" });
    expect(errors).toContain("name is required");
  });

  it("returns an error when name exceeds 120 characters", () => {
    const errors = validateCreateProject({
      name: "A".repeat(121),
      ownerId: "user-123",
    });
    expect(errors).toContain("name must be 120 characters or fewer");
  });

  it("accepts a name of exactly 120 characters", () => {
    const errors = validateCreateProject({
      name: "A".repeat(120),
      ownerId: "user-123",
    });
    expect(errors).not.toContain("name must be 120 characters or fewer");
  });

  it("returns an error when ownerId is missing", () => {
    const errors = validateCreateProject({ name: "My Project" });
    expect(errors).toContain("ownerId is required");
  });

  it("returns an error when ownerId is empty", () => {
    const errors = validateCreateProject({ name: "My Project", ownerId: "" });
    expect(errors).toContain("ownerId is required");
  });

  it("returns an error for an invalid status value", () => {
    const errors = validateCreateProject({
      name: "My Project",
      ownerId: "user-123",
      status: "invalid" as ProjectStatus,
    });
    expect(errors).toContain("status must be one of: active, archived, draft");
  });

  it("accepts all valid status values", () => {
    for (const status of ["active", "archived", "draft"] as ProjectStatus[]) {
      const errors = validateCreateProject({
        name: "My Project",
        ownerId: "user-123",
        status,
      });
      expect(errors).not.toContain("status must be one of: active, archived, draft");
    }
  });

  it("collects multiple validation errors", () => {
    const errors = validateCreateProject({});
    expect(errors).toContain("name is required");
    expect(errors).toContain("ownerId is required");
  });
});

// ---------------------------------------------------------------------------
// Unit tests — filterProjectsByStatus
// ---------------------------------------------------------------------------

describe("filterProjectsByStatus — unit tests", () => {
  it("returns only active projects", () => {
    const result = filterProjectsByStatus(projects, "active");
    expect(result.every((p) => p.status === "active")).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("returns only draft projects", () => {
    const result = filterProjectsByStatus(projects, "draft");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p2");
  });

  it("returns only archived projects", () => {
    const result = filterProjectsByStatus(projects, "archived");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p3");
  });

  it("returns an empty array when no projects match the status", () => {
    const result = filterProjectsByStatus(
      projects.filter((p) => p.status !== "archived"),
      "archived"
    );
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — sortProjectsByDate
// ---------------------------------------------------------------------------

describe("sortProjectsByDate — unit tests", () => {
  it("sorts descending by default", () => {
    const sorted = sortProjectsByDate(projects);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].updatedAt.getTime()).toBeGreaterThanOrEqual(
        sorted[i + 1].updatedAt.getTime()
      );
    }
  });

  it("sorts ascending when specified", () => {
    const sorted = sortProjectsByDate(projects, "asc");
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].updatedAt.getTime()).toBeLessThanOrEqual(
        sorted[i + 1].updatedAt.getTime()
      );
    }
  });

  it("does not mutate the original array", () => {
    const original = [...projects];
    sortProjectsByDate(projects, "asc");
    expect(projects).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — searchProjects
// ---------------------------------------------------------------------------

describe("searchProjects — unit tests", () => {
  it("returns all projects for an empty query", () => {
    expect(searchProjects(projects, "")).toHaveLength(projects.length);
  });

  it("matches by name (case-insensitive)", () => {
    const result = searchProjects(projects, "alpha");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alpha");
  });

  it("matches by description", () => {
    const result = searchProjects(projects, "menu development");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p4");
  });

  it("matches by tag", () => {
    const result = searchProjects(projects, "menu");
    expect(result.some((p) => p.id === "p4")).toBe(true);
  });

  it("returns empty array when nothing matches", () => {
    const result = searchProjects(projects, "xyznonexistent");
    expect(result).toHaveLength(0);
  });

  it("trims whitespace from query", () => {
    const result = searchProjects(projects, "  alpha  ");
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — formatting helpers
// ---------------------------------------------------------------------------

describe("formatProjectStatus — unit tests", () => {
  it("formats 'active' correctly", () => {
    expect(formatProjectStatus("active")).toBe("Active");
  });

  it("formats 'archived' correctly", () => {
    expect(formatProjectStatus("archived")).toBe("Archived");
  });

  it("formats 'draft' correctly", () => {
    expect(formatProjectStatus("draft")).toBe("Draft");
  });
});

describe("getProjectInitials — unit tests", () => {
  it("returns initials from a two-word name", () => {
    expect(getProjectInitials("Restaurant Rebrand")).toBe("RR");
  });

  it("returns a single initial for a one-word name", () => {
    expect(getProjectInitials("Alpha")).toBe("A");
  });

  it("uses only the first two words for longer names", () => {
    expect(getProjectInitials("Downtown Summer Rollout")).toBe("DS");
  });

  it("handles extra whitespace gracefully", () => {
    expect(getProjectInitials("  Big   Project  ")).toBe("BP");
  });
});

// ---------------------------------------------------------------------------
// Integration tests — combined filtering and sorting
// ---------------------------------------------------------------------------

describe("project filtering + sorting — integration tests", () => {
  it("filters active projects then sorts descending", () => {
    const active = filterProjectsByStatus(projects, "active");
    const sorted = sortProjectsByDate(active, "desc");

    expect(sorted.every((p) => p.status === "active")).toBe(true);
    expect(sorted[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
      sorted[sorted.length - 1].updatedAt.getTime()
    );
  });

  it("searches then filters by status", () => {
    const searched = searchProjects(projects, "a");
    const active = filterProjectsByStatus(searched, "active");
    expect(active.every((p) => p.status === "active")).toBe(true);
  });
});
