/**
 * sessions.test.ts
 * Tests for session utilities.
 */

import {
  AgentTaskStatus,
  Session,
  SessionStatus,
  calculateSessionProgress,
  formatSessionStatus,
  getAgentStatusColor,
} from "../src/utils/sessions";

describe("calculateSessionProgress", () => {
  const baseSession: Session = {
    sessionId: "session-1",
    status: "executing",
    createdAt: new Date().toISOString(),
  };

  it("should return zero progress for session with no tasks", () => {
    const result = calculateSessionProgress(baseSession);
    expect(result.total).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it("should calculate 100% when all tasks completed", () => {
    const session: Session = {
      ...baseSession,
      tasks: [
        { taskId: "t1", agentName: "research_architect", status: "completed" },
        { taskId: "t2", agentName: "strategy_architect", status: "completed" },
      ],
    };
    const result = calculateSessionProgress(session);
    expect(result.percentage).toBe(100);
    expect(result.completed).toBe(2);
  });

  it("should calculate 50% when half tasks completed", () => {
    const session: Session = {
      ...baseSession,
      tasks: [
        { taskId: "t1", agentName: "research_architect", status: "completed" },
        { taskId: "t2", agentName: "strategy_architect", status: "pending" },
      ],
    };
    const result = calculateSessionProgress(session);
    expect(result.percentage).toBe(50);
    expect(result.completed).toBe(1);
    expect(result.pending).toBe(1);
  });

  it("should count failed tasks separately", () => {
    const session: Session = {
      ...baseSession,
      tasks: [
        { taskId: "t1", agentName: "research_architect", status: "completed" },
        { taskId: "t2", agentName: "strategy_architect", status: "failed" },
        { taskId: "t3", agentName: "operations_architect", status: "running" },
      ],
    };
    const result = calculateSessionProgress(session);
    expect(result.failed).toBe(1);
    expect(result.running).toBe(1);
    expect(result.completed).toBe(1);
    expect(result.total).toBe(3);
  });

  it("should count 'waiting' tasks as pending", () => {
    const session: Session = {
      ...baseSession,
      tasks: [{ taskId: "t1", agentName: "agent", status: "waiting" }],
    };
    const result = calculateSessionProgress(session);
    expect(result.pending).toBe(1);
  });

  it("should preserve session status in result", () => {
    const session: Session = { ...baseSession, status: "completed" };
    const result = calculateSessionProgress(session);
    expect(result.status).toBe("completed");
  });
});

describe("formatSessionStatus", () => {
  it("should format 'planning' status", () => {
    expect(formatSessionStatus("planning")).toBe("Planning");
  });

  it("should format 'executing' status", () => {
    expect(formatSessionStatus("executing")).toBe("Executing");
  });

  it("should format 'completed' status", () => {
    expect(formatSessionStatus("completed")).toBe("Completed");
  });

  it("should format 'failed' status", () => {
    expect(formatSessionStatus("failed")).toBe("Failed");
  });

  it("should format all statuses to non-empty strings", () => {
    const statuses: SessionStatus[] = ["planning", "executing", "completed", "failed", "paused"];
    for (const status of statuses) {
      expect(typeof formatSessionStatus(status)).toBe("string");
      expect(formatSessionStatus(status).length).toBeGreaterThan(0);
    }
  });
});

describe("getAgentStatusColor", () => {
  it("should return 'green' for completed status", () => {
    expect(getAgentStatusColor("completed")).toBe("green");
  });

  it("should return 'red' for failed status", () => {
    expect(getAgentStatusColor("failed")).toBe("red");
  });

  it("should return 'blue' for running status", () => {
    expect(getAgentStatusColor("running")).toBe("blue");
  });

  it("should return 'gray' for pending status", () => {
    expect(getAgentStatusColor("pending")).toBe("gray");
  });

  it("should return 'gray' for waiting status", () => {
    expect(getAgentStatusColor("waiting")).toBe("gray");
  });

  it("should return a color string for all valid statuses", () => {
    const statuses: AgentTaskStatus[] = ["pending", "running", "completed", "failed", "waiting"];
    for (const status of statuses) {
      const color = getAgentStatusColor(status);
      expect(["green", "yellow", "red", "gray", "blue"]).toContain(color);
    }
  });
});
