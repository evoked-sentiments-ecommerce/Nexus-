import type { Objective, ObjectiveStatus } from "./types";

type ObjectiveCardProps = Objective;

const statusColorMap: Record<ObjectiveStatus, string> = {
  not_started: "#64748b",
  in_progress: "#2563eb",
  completed: "#16a34a",
  blocked: "#dc2626",
};

const statusLabel: Record<ObjectiveStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

export default function ObjectiveCard({
  title,
  description,
  status,
  progress,
  targetDate,
  ownerId,
  updatedAt,
}: ObjectiveCardProps) {
  const badgeColor = statusColorMap[status] ?? "#334155";
  const trimmedOwnerId = ownerId.trim();
  const ownerLabel =
    trimmedOwnerId === "system"
      ? "System"
      : trimmedOwnerId
        ? `User ${trimmedOwnerId.slice(0, Math.min(8, trimmedOwnerId.length)).toUpperCase()}`
        : "Unassigned";

  return (
    <article
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 16,
        backgroundColor: "#ffffff",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
        <span
          style={{
            backgroundColor: badgeColor,
            color: "#ffffff",
            borderRadius: 999,
            fontSize: 12,
            padding: "4px 10px",
            whiteSpace: "nowrap",
          }}
        >
          {statusLabel[status] ?? status}
        </span>
      </header>

      <p style={{ margin: "12px 0", color: "#334155" }}>
        {description || "No objective description provided."}
      </p>

      <div style={{ margin: "12px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#475569",
            marginBottom: 4,
          }}
        >
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div
          style={{
            height: 8,
            backgroundColor: "#e2e8f0",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: badgeColor,
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#475569",
          fontSize: 13,
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <span>Owner: {ownerLabel}</span>
        {targetDate && (
          <span>Target: {new Date(targetDate).toLocaleDateString()}</span>
        )}
        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
      </footer>
    </article>
  );
}
