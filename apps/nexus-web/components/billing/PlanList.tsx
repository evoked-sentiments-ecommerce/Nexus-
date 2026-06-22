import PlanCard from "./PlanCard";
import type { BillingCycle, PlanDefinition, SubscriptionPlan } from "./types";

type PlanListProps = {
  plans: PlanDefinition[];
  currentPlan?: SubscriptionPlan;
  billingCycle: BillingCycle;
};

export default function PlanList({ plans, currentPlan, billingCycle }: PlanListProps) {
  if (!plans.length) {
    return (
      <section
        style={{
          border: "1px dashed #94a3b8",
          borderRadius: 10,
          padding: 20,
          color: "#475569",
          backgroundColor: "#f8fafc",
        }}
      >
        No plans available.
      </section>
    );
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}
    >
      {plans.map((plan) => (
        <PlanCard
          key={plan.plan}
          {...plan}
          currentPlan={currentPlan}
          billingCycle={billingCycle}
        />
      ))}
    </section>
  );
}
