export type SubscriptionPlan = "starter" | "professional" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "paused";

export type BillingCycle = "monthly" | "annual";

export interface Subscription {
  id: string;
  customerId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  /** Amount in cents (e.g. 4900 = $49.00) */
  amount: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string | null;
  /** Stripe customer ID — populated after Stripe checkout */
  stripeCustomerId: string | null;
  /** Stripe subscription ID — populated after Stripe checkout */
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionInput {
  customerId: string;
  plan: SubscriptionPlan;
  status?: SubscriptionStatus;
  amount: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface UpdateSubscriptionInput {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  amount?: number;
  billingCycle?: BillingCycle;
  endDate?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

/** Static plan definition — used for pricing display. */
export interface PlanDefinition {
  plan: SubscriptionPlan;
  label: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  features: string[];
}

export const PLAN_DEFINITIONS: PlanDefinition[] = [
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
