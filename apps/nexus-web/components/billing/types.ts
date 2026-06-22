export type SubscriptionPlan = "starter" | "professional" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "paused";

export type BillingCycle = "monthly" | "annual";

export type Subscription = {
  id: string;
  customerId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  /** Amount in cents */
  amount: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanDefinition = {
  plan: SubscriptionPlan;
  label: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  features: string[];
};
