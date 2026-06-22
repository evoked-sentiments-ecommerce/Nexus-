import type { BlueprintFeature, BlueprintStatus, BlueprintType, HospitalityBlueprint } from "./types";

type BlueprintCardProps = HospitalityBlueprint;

const statusColorMap: Record<BlueprintStatus, string> = {
  draft: "#64748b",
  in_review: "#d97706",
  approved: "#2563eb",
  active: "#16a34a",
  archived: "#94a3b8",
};

const blueprintTypeLabel: Record<BlueprintType, string> = {
  restaurant: "Restaurant",
  hotel_fb: "Hotel F&B",
  resort: "Resort",
  private_club: "Private Club",
  catering: "Catering",
  executive_advisory: "Executive Advisory",
};

const blueprintTypeBadgeColor: Record<BlueprintType, string> = {
  restaurant: "#7c3aed",
  hotel_fb: "#0891b2",
  resort: "#0d9488",
  private_club: "#b45309",
  catering: "#c2410c",
  executive_advisory: "#1d4ed8",
};

const featureLabel: Record<BlueprintFeature, string> = {
  concept_development: "Concept Development",
  menu_engineering: "Menu Engineering",
  food_cost_models: "Food Cost Models",
  labor_models: "Labor Models",
  sop_generation: "SOP Generation",
  training_program_generation: "Training Programs",
  revenue_strategy: "Revenue Strategy",
  hospitality_operations_framework: "Ops Framework",
};

export default function BlueprintCard({
  title,
  description,
  blueprintType,
  features,
  status,
  foodCostTarget,
  laborCostTarget,
  ownerId,
  updatedAt,
}: BlueprintCardProps) {
  const statusColor = statusColorMap[status] ?? "#334155";
  const typeColor = blueprintTypeBadgeColor[blueprintType] ?? "#334155";
  const typeLabel = blueprintTypeLabel[blueprintType] ?? blueprintType;

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
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
        <span
          style={{
            backgroundColor: statusColor,
            color: "#ffffff",
            borderRadius: 999,
            fontSize: 12,
            padding: "4px 10px",
            textTransform: "capitalize",
            whiteSpace: "nowrap",
          }}
        >
          {status.replace("_", " ")}
        </span>
      </header>

      <span
        style={{
          display: "inline-block",
          backgroundColor: typeColor,
          color: "#ffffff",
          borderRadius: 6,
          fontSize: 11,
          padding: "3px 8px",
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {typeLabel}
      </span>

      <p style={{ margin: "0 0 12px", color: "#334155" }}>
        {description || "No blueprint description provided."}
      </p>

      {features.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {features.map((f) => (
            <span
              key={f}
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                borderRadius: 6,
                fontSize: 11,
                padding: "2px 8px",
                border: "1px solid #e2e8f0",
              }}
            >
              {featureLabel[f] ?? f}
            </span>
          ))}
        </div>
      )}

      <footer
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          color: "#475569",
          fontSize: 13,
          borderTop: "1px solid #f1f5f9",
          paddingTop: 10,
        }}
      >
        {foodCostTarget !== null && (
          <span>Food Cost: {foodCostTarget}%</span>
        )}
        {laborCostTarget !== null && (
          <span>Labor Cost: {laborCostTarget}%</span>
        )}
        <span>Owner: {ownerLabel}</span>
        <span style={{ marginLeft: "auto" }}>
          Updated: {new Date(updatedAt).toLocaleDateString()}
        </span>
      </footer>
    </article>
  );
}
