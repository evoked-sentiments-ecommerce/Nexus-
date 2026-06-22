import type { Brand, BrandStatus, ColorSwatch } from "./types";

type BrandCardProps = Brand;

const statusColorMap: Record<BrandStatus, string> = {
  draft: "#64748b",
  in_review: "#d97706",
  approved: "#2563eb",
  active: "#16a34a",
  archived: "#94a3b8",
};

const statusLabel: Record<BrandStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  active: "Active",
  archived: "Archived",
};

function ColorDot({ swatch }: { swatch: ColorSwatch }) {
  return (
    <span
      title={`${swatch.name}: ${swatch.hex}${swatch.usage ? ` — ${swatch.usage}` : ""}`}
      style={{
        display: "inline-block",
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: swatch.hex,
        border: "1px solid #e2e8f0",
      }}
    />
  );
}

export default function BrandCard({
  name,
  tagline,
  mission,
  vision,
  positioning,
  targetAudience,
  brandVoice,
  personality,
  coreValues,
  colorPalette,
  typography,
  status,
  ownerId,
  updatedAt,
}: BrandCardProps) {
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
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>{name}</h3>
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

      {tagline && (
        <p style={{ margin: "4px 0 12px", color: "#7c3aed", fontStyle: "italic", fontSize: 14 }}>
          {tagline}
        </p>
      )}

      {/* Mission & Vision */}
      {(mission || vision) && (
        <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {mission && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Mission
              </span>
              <p style={{ margin: "2px 0 0", color: "#334155", fontSize: 13 }}>{mission}</p>
            </div>
          )}
          {vision && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Vision
              </span>
              <p style={{ margin: "2px 0 0", color: "#334155", fontSize: 13 }}>{vision}</p>
            </div>
          )}
        </div>
      )}

      {/* Positioning & Audience */}
      {(positioning || targetAudience) && (
        <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {positioning && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Positioning
              </span>
              <p style={{ margin: "2px 0 0", color: "#334155", fontSize: 13 }}>{positioning}</p>
            </div>
          )}
          {targetAudience && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Target Audience
              </span>
              <p style={{ margin: "2px 0 0", color: "#334155", fontSize: 13 }}>{targetAudience}</p>
            </div>
          )}
        </div>
      )}

      {/* Brand Voice */}
      {brandVoice && (
        <div style={{ margin: "10px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Brand Voice
          </span>
          <p style={{ margin: "2px 0 0", color: "#334155", fontSize: 13 }}>{brandVoice}</p>
        </div>
      )}

      {/* Personality */}
      {personality.length > 0 && (
        <div style={{ margin: "10px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Personality
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {personality.map((trait) => (
              <span
                key={trait}
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  borderRadius: 4,
                  fontSize: 12,
                  padding: "2px 8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Core Values */}
      {coreValues.length > 0 && (
        <div style={{ margin: "10px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Core Values
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {coreValues.map((value) => (
              <span
                key={value}
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                  borderRadius: 4,
                  fontSize: 12,
                  padding: "2px 8px",
                  border: "1px solid #fde68a",
                }}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette */}
      {colorPalette.length > 0 && (
        <div style={{ margin: "10px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Color Palette
          </span>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {colorPalette.map((swatch) => (
              <ColorDot key={swatch.name} swatch={swatch} />
            ))}
          </div>
        </div>
      )}

      {/* Typography */}
      {typography.length > 0 && (
        <div style={{ margin: "10px 0" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Typography
          </span>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 13, color: "#334155" }}>
            {typography.map((spec) => (
              <li key={spec.role}>
                <strong>{spec.role}:</strong> {spec.family}
                {spec.weight ? ` ${spec.weight}` : ""}
              </li>
            ))}
          </ul>
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
