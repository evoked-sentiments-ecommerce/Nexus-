// ---------------------------------------------------------------------------
// Session Utilities — progress tracking and status formatting for agent sessions
// ---------------------------------------------------------------------------

export type SessionStatus = "planning" | "executing" | "completed" | "failed" | "paused";
export type AgentTaskStatus = "pending" | "running" | "completed" | "failed" | "waiting";

export type StatusColor = "green" | "yellow" | "red" | "gray" | "blue";

export interface AgentTask {
  taskId: string;
  agentName: string;
  status: AgentTaskStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export interface SessionProgress {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  running: number;
  percentage: number;
  status: SessionStatus;
}

export interface Session {
  sessionId: string;
  status: SessionStatus;
  tasks?: AgentTask[];
  results?: AgentTask[];
  createdAt: string;
  completedAt?: string;
}

export function calculateSessionProgress(session: Session): SessionProgress {
  const tasks = session.tasks ?? session.results ?? [];
  const total = tasks.length;

  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      running: 0,
      percentage: 0,
      status: session.status,
    };
  }

  const completed = tasks.filter((task) => task.status === "completed").length;
  const failed = tasks.filter((task) => task.status === "failed").length;
  const running = tasks.filter((task) => task.status === "running").length;
  const pending = tasks.filter((task) => task.status === "pending" || task.status === "waiting").length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, failed, pending, running, percentage, status: session.status };
}

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  planning: "Planning",
  executing: "Executing",
  completed: "Completed",
  failed: "Failed",
  paused: "Paused",
};

export function formatSessionStatus(status: SessionStatus): string {
  return SESSION_STATUS_LABELS[status] ?? status;
}

const AGENT_STATUS_COLORS: Record<AgentTaskStatus, StatusColor> = {
  completed: "green",
  running: "blue",
  pending: "gray",
  waiting: "gray",
  failed: "red",
};

export function getAgentStatusColor(status: AgentTaskStatus): StatusColor {
  return AGENT_STATUS_COLORS[status] ?? "gray";
}
