import type { Project, ProjectStatus } from "./types";

type ProjectCardProps = Project;

const statusColorMap: Record<ProjectStatus, string> = {
  planned: "#64748b",
  active: "#2563eb",
  blocked: "#dc2626",
  completed: "#16a34a",
};

export default function ProjectCard({
  title,
  description,
  status,
  priority,
  ownerId,
  updatedAt,
}: ProjectCardProps) {
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
            textTransform: "capitalize",
          }}
        >
          {status}
        </span>
      </header>

      <p style={{ margin: "12px 0", color: "#334155" }}>
        {description || "No project description provided."}
      </p>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#475569",
          fontSize: 13,
        }}
      >
        <span style={{ textTransform: "capitalize" }}>Priority: {priority}</span>
        <span>Owner: {ownerLabel}</span>
        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
      </footer>
    </article>
  );
}
