import type { PDFGenerationStatus, PDFTemplate, PDFTemplateType } from "./types";

type PDFTemplateCardProps = PDFTemplate;

const statusColorMap: Record<PDFGenerationStatus, string> = {
  pending: "#d97706",
  generated: "#16a34a",
  failed: "#dc2626",
};

const statusLabel: Record<PDFGenerationStatus, string> = {
  pending: "Pending",
  generated: "Generated",
  failed: "Failed",
};

const templateLabel: Record<PDFTemplateType, string> = {
  proposal: "Proposal",
  business_plan: "Business Plan",
  brand_guide: "Brand Guide",
  sop: "SOP",
  training_manual: "Training Manual",
  recipe: "Recipe",
};

const exportControlLabel: Record<string, string> = {
  include_cover_page: "Include Cover Page",
  include_toc: "Include TOC",
  include_branding: "Include Branding",
  optimize_for_print: "Optimize for Print",
  enable_watermark: "Enable Watermark",
};

export default function PDFTemplateCard({
  title,
  templateType,
  status,
  projectId,
  documentId,
  previewUrl,
  downloadUrl,
  exportControls,
  updatedAt,
}: PDFTemplateCardProps) {
  const badgeColor = statusColorMap[status] ?? "#334155";

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
            {templateLabel[templateType] ?? templateType}
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
        <div>Source Document: {documentId}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <p style={{ margin: 0, color: "#475569", fontSize: 13, fontWeight: 600 }}>
          Export Controls
        </p>
        {exportControls.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {exportControls.map((control) => (
              <span
                key={control}
                style={{
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  fontSize: 12,
                  color: "#334155",
                  padding: "2px 8px",
                }}
              >
                {exportControlLabel[control] ?? control}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 13 }}>
            No export controls selected.
          </p>
        )}
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #0f172a",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Generate PDF
          </button>
          <a
            href={previewUrl ?? "#"}
            aria-disabled={!previewUrl}
            style={{
              pointerEvents: previewUrl ? "auto" : "none",
              opacity: previewUrl ? 1 : 0.5,
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              backgroundColor: "#ffffff",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Preview
          </a>
          <a
            href={downloadUrl ?? "#"}
            aria-disabled={!downloadUrl}
            style={{
              pointerEvents: downloadUrl ? "auto" : "none",
              opacity: downloadUrl ? 1 : 0.5,
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #2563eb",
              color: "#ffffff",
              backgroundColor: "#2563eb",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Download PDF
          </a>
        </div>
      </footer>
    </article>
  );
}
