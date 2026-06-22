import type { Package, PackageStatus, PackageType } from "./types";

type PackageCardProps = Package;

const statusColorMap: Record<PackageStatus, string> = {
  draft: "#64748b",
  assembling: "#d97706",
  ready: "#16a34a",
  archived: "#94a3b8",
};

const statusLabel: Record<PackageStatus, string> = {
  draft: "Draft",
  assembling: "Assembling",
  ready: "Ready",
  archived: "Archived",
};

const packageTypeLabel: Record<PackageType, string> = {
  startup: "Startup Package",
  brand: "Brand Package",
  operations: "Operations Package",
  training: "Training Package",
  hospitality_blueprint: "Hospitality Blueprint Package",
  executive: "Executive Package",
};

export default function PackageCard({
  packageName,
  packageType,
  status,
  projectId,
  objectiveId,
  includedDocuments,
  includedPDFs,
  includedAssets,
  downloadUrl,
  ownerId,
  updatedAt,
}: PackageCardProps) {
  const badgeColor = statusColorMap[status] ?? "#334155";
  const trimmedOwnerId = ownerId.trim();
  const ownerLabel =
    trimmedOwnerId === "system"
      ? "System"
      : trimmedOwnerId
        ? `User ${trimmedOwnerId.slice(0, Math.min(8, trimmedOwnerId.length)).toUpperCase()}`
        : "Unassigned";

  const totalAssets = includedDocuments.length + includedPDFs.length + includedAssets.length;

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
          <h3 style={{ margin: 0, fontSize: 18 }}>{packageName}</h3>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>
            {packageTypeLabel[packageType] ?? packageType}
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

      <div style={{ margin: "10px 0", color: "#334155", fontSize: 13 }}>
        <div>Project: {projectId}</div>
        {objectiveId && <div>Objective: {objectiveId}</div>}
        <div style={{ marginTop: 4, color: "#475569" }}>Owner: {ownerLabel}</div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          margin: "12px 0",
          flexWrap: "wrap",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            {includedDocuments.length}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Documents</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            {includedPDFs.length}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>PDFs</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            {includedAssets.length}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Assets</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>{totalAssets}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Total</div>
        </div>
      </div>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#475569",
          fontSize: 13,
          marginTop: 14,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
        <a
          href={downloadUrl ?? "#"}
          aria-disabled={!downloadUrl}
          style={{
            pointerEvents: downloadUrl ? "auto" : "none",
            opacity: downloadUrl ? 1 : 0.5,
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            color: "#ffffff",
            backgroundColor: "#2563eb",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Download Package
        </a>
      </footer>
    </article>
  );
}
