import PlanList from "../../components/billing/PlanList";
import type {
  BillingCycle,
  PlanDefinition,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../components/billing/types";

// ---------------------------------------------------------------------------
// Static fallback plan catalogue (mirrors PLAN_DEFINITIONS in the API entity)
// ---------------------------------------------------------------------------
const fallbackPlans: PlanDefinition[] = [
  {
    plan: "starter",
    label: "Starter",
    description: "Everything you need to launch your first Nexus project.",
    monthlyAmount: 4900,
    annualAmount: 49000,
    features: [
      "Up to 3 projects",
      "5 GB document storage",
      "PDF generation",
      "Basic brand tools",
      "Email support",
    ],
  },
  {
    plan: "professional",
    label: "Professional",
    description: "Advanced tools for growing teams and multi-brand operations.",
    monthlyAmount: 14900,
    annualAmount: 149000,
    features: [
      "Unlimited projects",
      "50 GB document storage",
      "Chef Drew Engine",
      "Full brand toolkit",
      "Research & objective tracking",
      "Priority support",
    ],
  },
  {
    plan: "enterprise",
    label: "Enterprise",
    description: "Custom deployments, SLAs, and dedicated advisory access.",
    monthlyAmount: 49900,
    annualAmount: 499000,
    features: [
      "Everything in Professional",
      "Unlimited storage",
      "Executive Advisory blueprints",
      "Custom integrations",
      "Dedicated account manager",
      "99.9% uptime SLA",
    ],
  },
];

const statusColorMap: Record<SubscriptionStatus, string> = {
  active: "#16a34a",
  trialing: "#2563eb",
  past_due: "#dc2626",
  canceled: "#94a3b8",
  incomplete: "#d97706",
  paused: "#64748b",
};

const formatAmount = (cents: number): string =>
  `$${(cents / 100).toFixed(0)}`;

async function getPlans(): Promise<PlanDefinition[]> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(`${apiBaseUrl}/api/billing/plans`, {
      cache: "no-store",
    });
    if (!response.ok) return fallbackPlans;
    return (await response.json()) as PlanDefinition[];
  } catch {
    return fallbackPlans;
  }
}

async function getSubscription(customerId: string): Promise<Subscription | null> {
  try {
    const apiBaseUrl = process.env.API_URL ?? "http://localhost:3000";
    const response = await fetch(
      `${apiBaseUrl}/api/billing/subscription?customerId=${encodeURIComponent(customerId)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return (await response.json()) as Subscription;
  } catch {
    return null;
  }
}

type BillingPageProps = {
  searchParams?: Promise<{ cycle?: string; customerId?: string }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = (await searchParams) ?? {};
  const rawCycle = typeof params.cycle === "string" ? params.cycle : "monthly";
  const billingCycle: BillingCycle =
    rawCycle === "annual" ? "annual" : "monthly";

  // In a real app, customerId comes from the authenticated session.
  const customerId =
    typeof params.customerId === "string" ? params.customerId : "system";

  const [plans, subscription] = await Promise.all([
    getPlans(),
    getSubscription(customerId),
  ]);

  const currentPlan: SubscriptionPlan | undefined =
    subscription?.status === "active" || subscription?.status === "trialing"
      ? subscription.plan
      : undefined;

  return (
    <main style={{ padding: 24, backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>Billing Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#475569" }}>
            Manage your subscription, plan, and billing cycle.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <form method="GET" style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <input type="hidden" name="customerId" value={customerId} />
          <button
            name="cycle"
            value="monthly"
            type="submit"
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor: billingCycle === "monthly" ? "#0f172a" : "#ffffff",
              color: billingCycle === "monthly" ? "#ffffff" : "#334155",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Monthly
          </button>
          <button
            name="cycle"
            value="annual"
            type="submit"
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor: billingCycle === "annual" ? "#0f172a" : "#ffffff",
              color: billingCycle === "annual" ? "#ffffff" : "#334155",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Annual
          </button>
        </form>
      </header>

      {/* Current subscription status */}
      {subscription && (
        <section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Current Plan</p>
            <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 18, textTransform: "capitalize" }}>
              {subscription.plan}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Status</p>
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                backgroundColor: statusColorMap[subscription.status] ?? "#64748b",
                color: "#ffffff",
                borderRadius: 999,
                fontSize: 12,
                padding: "3px 10px",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {subscription.status.replace("_", " ")}
            </span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Amount</p>
            <p style={{ margin: "4px 0 0", fontWeight: 700, fontSize: 18 }}>
              {formatAmount(subscription.amount)}{" "}
              <span style={{ fontWeight: 400, fontSize: 13, color: "#64748b" }}>
                / {subscription.billingCycle}
              </span>
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Started</p>
            <p style={{ margin: "4px 0 0", fontWeight: 600 }}>
              {new Date(subscription.startDate).toLocaleDateString()}
            </p>
          </div>
          {subscription.endDate && (
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Ends</p>
              <p style={{ margin: "4px 0 0", fontWeight: 600 }}>
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </section>
      )}

      <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>Available Plans</h2>
      <PlanList plans={plans} currentPlan={currentPlan} billingCycle={billingCycle} />
    </main>
  );
}
