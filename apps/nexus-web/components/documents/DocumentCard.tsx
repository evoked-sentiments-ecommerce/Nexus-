import type { Document, DocumentStatus, DocumentType } from "./types";

type DocumentCardProps = Document;

const statusColorMap: Record<DocumentStatus, string> = {
  draft: "#64748b",
  published: "#16a34a",
  archived: "#94a3b8",
};

const statusLabel: Record<DocumentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const typeLabel: Record<DocumentType, string> = {
  proposal: "Proposal",
  business_plan: "Business Plan",
  strategy: "Strategy",
  sop: "SOP",
  training_manual: "Training Manual",
  marketing_plan: "Marketing Plan",
  brand_guide: "Brand Guide",
  recipe: "Recipe",
  report: "Report",
  contract: "Contract",
};

export default function DocumentCard({
  title,
  documentType,
  content,
  status,
  version,
  tags,
  ownerId,
  updatedAt,
}: DocumentCardProps) {
  const badgeColor = statusColorMap[status] ?? "#334155";
  const trimmedOwnerId = ownerId.trim();
  const ownerLabel =
    trimmedOwnerId === "system"
      ? "System"
      : trimmedOwnerId
        ? `User ${trimmedOwnerId.slice(0, Math.min(8, trimmedOwnerId.length)).toUpperCase()}`
        : "Unassigned";

  const contentPreview = content.trim()
    ? content.slice(0, 180) + (content.length > 180 ? "..." : "")
    : "No document content yet.";

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
          marginBottom: 8,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>
            {typeLabel[documentType] ?? documentType}
          </p>
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

      <p style={{ margin: "12px 0", color: "#334155", fontSize: 14 }}>{contentPreview}</p>

      <div style={{ margin: "10px 0", color: "#475569", fontSize: 13 }}>
        Version: <strong>v{version}</strong>
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                fontSize: 12,
                color: "#334155",
                padding: "2px 8px",
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
