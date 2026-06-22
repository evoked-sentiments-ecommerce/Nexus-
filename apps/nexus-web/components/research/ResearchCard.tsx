import type { ResearchItem, ResearchItemStatus, ResearchItemType } from "./types";

type ResearchCardProps = ResearchItem;

const statusColorMap: Record<ResearchItemStatus, string> = {
  draft: "#64748b",
  in_review: "#d97706",
  published: "#16a34a",
  archived: "#94a3b8",
};

const statusLabel: Record<ResearchItemStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  published: "Published",
  archived: "Archived",
};

const typeLabel: Record<ResearchItemType, string> = {
  project: "Project",
  note: "Note",
  source: "Source",
  finding: "Finding",
  attachment: "Attachment",
};

const typeColorMap: Record<ResearchItemType, string> = {
  project: "#0f172a",
  note: "#2563eb",
  source: "#7c3aed",
  finding: "#0891b2",
  attachment: "#475569",
};

export default function ResearchCard({
  title,
  notes,
  type,
  status,
  tags,
  findings,
  sources,
  attachments,
  ownerId,
  updatedAt,
}: ResearchCardProps) {
  const badgeColor = statusColorMap[status] ?? "#334155";
  const typeBadgeColor = typeColorMap[type] ?? "#334155";
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              backgroundColor: typeBadgeColor,
              color: "#ffffff",
              borderRadius: 4,
              fontSize: 11,
              padding: "2px 7px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {typeLabel[type] ?? type}
          </span>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
        </div>
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

      {notes && (
        <p style={{ margin: "12px 0 8px", color: "#334155" }}>{notes}</p>
      )}

      {findings.length > 0 && (
        <div style={{ margin: "8px 0" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#475569", fontWeight: 600 }}>
            Findings
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", fontSize: 13 }}>
            {findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {sources.length > 0 && (
        <div style={{ margin: "8px 0" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#475569", fontWeight: 600 }}>
            Sources
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", fontSize: 13 }}>
            {sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {attachments.length > 0 && (
        <div style={{ margin: "8px 0" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#475569", fontWeight: 600 }}>
            Attachments
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", fontSize: 13 }}>
            {attachments.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 0" }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                borderRadius: 4,
                fontSize: 12,
                padding: "2px 8px",
                border: "1px solid #e2e8f0",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#475569",
          fontSize: 13,
          marginTop: 12,
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        <span>Owner: {ownerLabel}</span>
        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
      </footer>
    </article>
  );
}
