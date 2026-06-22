/**
 * objectives.test.ts
 *
 * Unit + Integration tests for the Nexus objective system utilities.
 */

import {
  validateCreateObjective,
  filterObjectivesByStatus,
  filterObjectivesByPriority,
  sortObjectivesByPriority,
  getOverdueObjectives,
  formatObjectiveStatus,
  formatObjectivePriority,
  calculateObjectiveProgress,
  Objective,
  ObjectivePriority,
  ObjectiveStatus,
  ObjectiveProgress,
} from "../../src/utils/objectives";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeObjective(overrides: Partial<Objective> = {}): Objective {
  return {
    id: "obj-001",
    title: "Launch summer menu",
    description: "Prepare and launch the summer menu lineup",
    priority: "high",
    status: "pending",
    projectId: "proj-001",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
    ...overrides,
  };
}

const objectives: Objective[] = [
  makeObjective({ id: "o1", priority: "critical", status: "in_progress" }),
  makeObjective({ id: "o2", priority: "high", status: "completed", completedAt: new Date("2024-03-10") }),
  makeObjective({ id: "o3", priority: "medium", status: "pending" }),
  makeObjective({ id: "o4", priority: "low", status: "cancelled" }),
  makeObjective({ id: "o5", priority: "high", status: "pending" }),
];

// ---------------------------------------------------------------------------
// Unit tests — validateCreateObjective
// ---------------------------------------------------------------------------

describe("validateCreateObjective — unit tests", () => {
  it("returns no errors for a valid input", () => {
    const errors = validateCreateObjective({
      title: "Complete market research",
      projectId: "proj-001",
      priority: "medium",
    });
    expect(errors).toHaveLength(0);
  });

  it("returns an error when title is missing", () => {
    const errors = validateCreateObjective({ projectId: "proj-001" });
    expect(errors).toContain("title is required");
  });

  it("returns an error when title is an empty string", () => {
    const errors = validateCreateObjective({ title: "  ", projectId: "proj-001" });
    expect(errors).toContain("title is required");
  });

  it("returns an error when title exceeds 200 characters", () => {
    const errors = validateCreateObjective({
      title: "T".repeat(201),
      projectId: "proj-001",
    });
    expect(errors).toContain("title must be 200 characters or fewer");
  });

  it("accepts a title of exactly 200 characters", () => {
    const errors = validateCreateObjective({
      title: "T".repeat(200),
      projectId: "proj-001",
    });
    expect(errors).not.toContain("title must be 200 characters or fewer");
  });

  it("returns an error when projectId is missing", () => {
    const errors = validateCreateObjective({ title: "My Objective" });
    expect(errors).toContain("projectId is required");
  });

  it("returns an error when projectId is empty", () => {
    const errors = validateCreateObjective({
      title: "My Objective",
      projectId: "",
    });
    expect(errors).toContain("projectId is required");
  });

  it("returns an error for an invalid priority value", () => {
    const errors = validateCreateObjective({
      title: "My Objective",
      projectId: "proj-001",
      priority: "urgent" as ObjectivePriority,
    });
    expect(errors).toContain("priority must be one of: low, medium, high, critical");
  });

  it("accepts all valid priority values", () => {
    for (const priority of ["low", "medium", "high", "critical"] as ObjectivePriority[]) {
      const errors = validateCreateObjective({
        title: "My Objective",
        projectId: "proj-001",
        priority,
      });
      expect(errors).not.toContain(
        "priority must be one of: low, medium, high, critical"
      );
    }
  });

  it("returns an error for an invalid dueDate", () => {
    const errors = validateCreateObjective({
      title: "My Objective",
      projectId: "proj-001",
      dueDate: new Date("not-a-date"),
    });
    expect(errors).toContain("dueDate must be a valid date");
  });

  it("accepts a valid dueDate", () => {
    const errors = validateCreateObjective({
      title: "My Objective",
      projectId: "proj-001",
      dueDate: new Date("2025-12-31"),
    });
    expect(errors).not.toContain("dueDate must be a valid date");
  });

  it("collects multiple validation errors", () => {
    const errors = validateCreateObjective({});
    expect(errors).toContain("title is required");
    expect(errors).toContain("projectId is required");
  });
});

// ---------------------------------------------------------------------------
// Unit tests — filterObjectivesByStatus
// ---------------------------------------------------------------------------

describe("filterObjectivesByStatus — unit tests", () => {
  it("returns only pending objectives", () => {
    const result = filterObjectivesByStatus(objectives, "pending");
    expect(result.every((o) => o.status === "pending")).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("returns only completed objectives", () => {
    const result = filterObjectivesByStatus(objectives, "completed");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o2");
  });

  it("returns only in_progress objectives", () => {
    const result = filterObjectivesByStatus(objectives, "in_progress");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o1");
  });

  it("returns empty array when no objectives match", () => {
    const result = filterObjectivesByStatus(
      objectives.filter((o) => o.status !== "cancelled"),
      "cancelled"
    );
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — filterObjectivesByPriority
// ---------------------------------------------------------------------------

describe("filterObjectivesByPriority — unit tests", () => {
  it("returns only critical objectives", () => {
    const result = filterObjectivesByPriority(objectives, "critical");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o1");
  });

  it("returns only high priority objectives", () => {
    const result = filterObjectivesByPriority(objectives, "high");
    expect(result).toHaveLength(2);
  });

  it("returns empty array for a priority with no matches", () => {
    const result = filterObjectivesByPriority(
      objectives.filter((o) => o.priority !== "low"),
      "low"
    );
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — sortObjectivesByPriority
// ---------------------------------------------------------------------------

describe("sortObjectivesByPriority — unit tests", () => {
  it("sorts with critical first and low last", () => {
    const sorted = sortObjectivesByPriority(objectives);
    expect(sorted[0].priority).toBe("critical");
    expect(sorted[sorted.length - 1].priority).toBe("low");
  });

  it("does not mutate the original array", () => {
    const original = [...objectives];
    sortObjectivesByPriority(objectives);
    expect(objectives).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — getOverdueObjectives
// ---------------------------------------------------------------------------

describe("getOverdueObjectives — unit tests", () => {
  it("returns objectives with a past dueDate that are not done/cancelled", () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 86400000); // yesterday
    const futureDate = new Date(now.getTime() + 86400000); // tomorrow

    const items: Objective[] = [
      makeObjective({ id: "overdue-pending", dueDate: pastDate, status: "pending" }),
      makeObjective({ id: "overdue-inprogress", dueDate: pastDate, status: "in_progress" }),
      makeObjective({ id: "not-overdue-future", dueDate: futureDate, status: "pending" }),
      makeObjective({ id: "done-past", dueDate: pastDate, status: "completed" }),
      makeObjective({ id: "cancelled-past", dueDate: pastDate, status: "cancelled" }),
      makeObjective({ id: "no-due-date", status: "pending" }),
    ];

    const overdue = getOverdueObjectives(items);
    expect(overdue.map((o) => o.id)).toEqual(
      expect.arrayContaining(["overdue-pending", "overdue-inprogress"])
    );
    expect(overdue.map((o) => o.id)).not.toContain("not-overdue-future");
    expect(overdue.map((o) => o.id)).not.toContain("done-past");
    expect(overdue.map((o) => o.id)).not.toContain("cancelled-past");
    expect(overdue.map((o) => o.id)).not.toContain("no-due-date");
  });

  it("returns an empty array when no objectives are overdue", () => {
    const futureDate = new Date(Date.now() + 86400000);
    const items = [
      makeObjective({ dueDate: futureDate, status: "pending" }),
    ];
    expect(getOverdueObjectives(items)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — formatting helpers
// ---------------------------------------------------------------------------

describe("formatObjectiveStatus — unit tests", () => {
  const cases: [ObjectiveStatus, string][] = [
    ["pending", "Pending"],
    ["in_progress", "In Progress"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ];

  it.each(cases)("formats '%s' as '%s'", (status, expected) => {
    expect(formatObjectiveStatus(status)).toBe(expected);
  });
});

describe("formatObjectivePriority — unit tests", () => {
  const cases: [ObjectivePriority, string][] = [
    ["low", "Low"],
    ["medium", "Medium"],
    ["high", "High"],
    ["critical", "Critical"],
  ];

  it.each(cases)("formats '%s' as '%s'", (priority, expected) => {
    expect(formatObjectivePriority(priority)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — calculateObjectiveProgress
// ---------------------------------------------------------------------------

describe("calculateObjectiveProgress — unit tests", () => {
  it("returns all zeros for an empty array", () => {
    const result: ObjectiveProgress = calculateObjectiveProgress([]);
    expect(result.total).toBe(0);
    expect(result.percentComplete).toBe(0);
  });

  it("calculates correct counts for a mixed set", () => {
    const result = calculateObjectiveProgress(objectives);
    expect(result.total).toBe(5);
    expect(result.completed).toBe(1);
    expect(result.inProgress).toBe(1);
    expect(result.pending).toBe(2);
    expect(result.cancelled).toBe(1);
  });

  it("calculates 100% when all objectives are completed", () => {
    const all = objectives.map((o) => ({ ...o, status: "completed" as ObjectiveStatus }));
    const result = calculateObjectiveProgress(all);
    expect(result.percentComplete).toBe(100);
  });

  it("calculates 0% when no objectives are completed", () => {
    const none = objectives.map((o) => ({ ...o, status: "pending" as ObjectiveStatus }));
    const result = calculateObjectiveProgress(none);
    expect(result.percentComplete).toBe(0);
  });

  it("rounds percentage to the nearest integer", () => {
    const items: Objective[] = [
      makeObjective({ id: "a", status: "completed" }),
      makeObjective({ id: "b", status: "completed" }),
      makeObjective({ id: "c", status: "pending" }),
    ];
    const result = calculateObjectiveProgress(items);
    expect(result.percentComplete).toBe(67); // 2/3 = 66.67 → 67
  });
});

// ---------------------------------------------------------------------------
// Integration tests — combined filter + sort + progress
// ---------------------------------------------------------------------------

describe("objective pipeline — integration tests", () => {
  it("filters active objectives then calculates progress", () => {
    const active = filterObjectivesByStatus(objectives, "in_progress");
    const progress = calculateObjectiveProgress(active);
    expect(progress.inProgress).toBe(active.length);
  });

  it("sorts by priority then checks order is stable with filter", () => {
    const highPriority = filterObjectivesByPriority(objectives, "high");
    const sorted = sortObjectivesByPriority(highPriority);
    expect(sorted.every((o) => o.priority === "high")).toBe(true);
  });

  it("gets overdue items and verifies none are completed", () => {
    const now = new Date();
    const pastDue = objectives.map((o) => ({
      ...o,
      dueDate: new Date(now.getTime() - 86400000),
    }));
    const overdue = getOverdueObjectives(pastDue);
    expect(overdue.every((o) => o.status !== "completed" && o.status !== "cancelled")).toBe(true);
  });
});
