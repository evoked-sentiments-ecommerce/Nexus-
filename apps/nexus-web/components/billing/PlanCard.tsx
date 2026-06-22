import type { BillingCycle, PlanDefinition, SubscriptionPlan } from "./types";

type PlanCardProps = PlanDefinition & {
  currentPlan?: SubscriptionPlan;
  billingCycle: BillingCycle;
};

const planAccentColor: Record<SubscriptionPlan, string> = {
  starter: "#2563eb",
  professional: "#7c3aed",
  enterprise: "#0d9488",
};

const formatAmount = (cents: number): string =>
  `$${(cents / 100).toFixed(0)}`;

export default function PlanCard({
  plan,
  label,
  description,
  monthlyAmount,
  annualAmount,
  features,
  currentPlan,
  billingCycle,
}: PlanCardProps) {
  const accent = planAccentColor[plan] ?? "#334155";
  const isCurrentPlan = currentPlan === plan;
  const displayAmount = billingCycle === "annual" ? annualAmount : monthlyAmount;
  const cycleLabel = billingCycle === "annual" ? "/ year" : "/ month";

  return (
    <article
      style={{
        border: isCurrentPlan ? `2px solid ${accent}` : "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 24,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
      }}
    >
      {isCurrentPlan && (
        <span
          style={{
            position: "absolute",
            top: -12,
            left: 20,
            backgroundColor: accent,
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Current Plan
        </span>
      )}

      <header>
        <span
          style={{
            display: "inline-block",
            backgroundColor: accent,
            color: "#ffffff",
            borderRadius: 6,
            fontSize: 11,
            padding: "3px 8px",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {label}
        </span>
        <p style={{ margin: 0, color: "#475569", fontSize: 14 }}>{description}</p>
      </header>

      <div>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#0f172a" }}>
          {formatAmount(displayAmount)}
        </span>
        <span style={{ color: "#64748b", fontSize: 14, marginLeft: 4 }}>{cycleLabel}</span>
        {billingCycle === "annual" && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#16a34a" }}>
            Save {formatAmount(monthlyAmount * 12 - annualAmount)} vs monthly
          </p>
        )}
      </div>

      <ul style={{ margin: 0, padding: "0 0 0 18px", color: "#334155", fontSize: 14 }}>
        {features.map((feature) => (
          <li key={feature} style={{ marginBottom: 6 }}>
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isCurrentPlan}
        style={{
          marginTop: "auto",
          padding: "10px 0",
          borderRadius: 8,
          border: isCurrentPlan ? "1px solid #e2e8f0" : `1px solid ${accent}`,
          backgroundColor: isCurrentPlan ? "#f8fafc" : accent,
          color: isCurrentPlan ? "#94a3b8" : "#ffffff",
          fontWeight: 600,
          fontSize: 15,
          cursor: isCurrentPlan ? "default" : "pointer",
        }}
      >
        {isCurrentPlan ? "Active" : "Upgrade"}
      </button>
    </article>
  );
}
