import Stripe from "stripe";
import {
  PLAN_DEFINITIONS,
  type BillingCycle,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from "../entities/Subscription";

export type CreateCheckoutSessionInput = {
  customerId: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId?: string | null;
  customerEmail?: string | null;
};

export type CreatePortalSessionInput = {
  stripeCustomerId: string;
  returnUrl: string;
};

export type StripeSubscriptionSnapshot = {
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  customerId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string | null;
};

export type CheckoutCompletionPayload = {
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  customerId: string | null;
  plan: SubscriptionPlan | null;
  billingCycle: BillingCycle | null;
  amount: number | null;
};

export type StripeWebhookMutation =
  | { kind: "subscription_upsert"; snapshot: StripeSubscriptionSnapshot }
  | { kind: "checkout_completed"; payload: CheckoutCompletionPayload }
  | { kind: "invoice_payment_failed"; stripeSubscriptionId: string }
  | { kind: "invoice_payment_succeeded"; stripeSubscriptionId: string };

const STRIPE_PRICE_BY_PLAN: Record<SubscriptionPlan, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};
const PRICE_ENV_BY_PLAN: Record<SubscriptionPlan, string> = {
  starter: "STRIPE_PRICE_STARTER",
  professional: "STRIPE_PRICE_PROFESSIONAL",
  enterprise: "STRIPE_PRICE_ENTERPRISE",
};

const PRICE_ID_TO_PLAN = Object.entries(STRIPE_PRICE_BY_PLAN).reduce(
  (acc, [plan, priceId]) => {
    if (priceId) acc[priceId] = plan as SubscriptionPlan;
    return acc;
  },
  {} as Record<string, SubscriptionPlan>,
);

const isBillingCycle = (value: unknown): value is BillingCycle =>
  value === "monthly" || value === "annual";

const isSubscriptionPlan = (value: unknown): value is SubscriptionPlan =>
  value === "starter" || value === "professional" || value === "enterprise";

const statusFromStripe = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "paused":
      return "paused";
    case "unpaid":
      return "past_due";
    default:
      return "incomplete";
  }
};

const toIso = (value: number | null | undefined): string | null =>
  typeof value === "number" ? new Date(value * 1000).toISOString() : null;

const getPlanAmount = (plan: SubscriptionPlan, billingCycle: BillingCycle): number => {
  const definition = PLAN_DEFINITIONS.find((p) => p.plan === plan);
  if (!definition) return 0;
  return billingCycle === "annual" ? definition.annualAmount : definition.monthlyAmount;
};

const getStripeSecretKey = (): string => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return secretKey;
};

const getStripeWebhookSecret = (): string => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  return webhookSecret;
};

let stripeClient: Stripe | null = null;

const getStripeClient = (): Stripe => {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
};

const getPriceIdForPlan = (plan: SubscriptionPlan): string => {
  const priceId = STRIPE_PRICE_BY_PLAN[plan];
  if (!priceId) {
    throw new Error(
      `Missing ${PRICE_ENV_BY_PLAN[plan]} for plan: ${plan}`,
    );
  }

  return priceId;
};

const parseSubscriptionPlan = (
  metadataPlan: string | undefined,
  priceId: string | null,
): SubscriptionPlan => {
  if (metadataPlan && isSubscriptionPlan(metadataPlan)) {
    return metadataPlan;
  }

  if (priceId && PRICE_ID_TO_PLAN[priceId]) {
    return PRICE_ID_TO_PLAN[priceId];
  }

  throw new Error(
    `Unable to resolve subscription plan from Stripe payload (metadata.plan=${String(metadataPlan)}, priceId=${String(priceId)})`,
  );
};

const parseBillingCycle = (
  metadataCycle: string | undefined,
  interval: Stripe.Price.Recurring.Interval | null,
): BillingCycle => {
  if (metadataCycle && isBillingCycle(metadataCycle)) {
    return metadataCycle;
  }

  return interval === "year" ? "annual" : "monthly";
};

const normalizeStripeSubscription = (
  subscription: Stripe.Subscription,
): StripeSubscriptionSnapshot => {
  const primaryItem = subscription.items.data[0];
  const price = primaryItem?.price;
  const priceId = typeof price?.id === "string" ? price.id : null;
  const interval = price?.recurring?.interval ?? null;
  const metadataPlan = subscription.metadata?.plan;
  const metadataCycle = subscription.metadata?.billingCycle;

  const plan = parseSubscriptionPlan(metadataPlan, priceId);
  const billingCycle = parseBillingCycle(metadataCycle, interval);
  const amount =
    typeof price?.unit_amount === "number"
      ? price.unit_amount
      : getPlanAmount(plan, billingCycle);

  return {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : null,
    customerId: subscription.metadata?.customerId ?? null,
    plan,
    status: statusFromStripe(subscription.status),
    amount,
    billingCycle,
    startDate:
      toIso(subscription.current_period_start) ??
      toIso(subscription.created) ??
      new Date().toISOString(),
    endDate:
      toIso(subscription.canceled_at) ??
      (subscription.cancel_at_period_end ? toIso(subscription.current_period_end) : null),
  };
};

export const createCheckoutSession = async (
  input: CreateCheckoutSessionInput,
): Promise<Stripe.Checkout.Session> => {
  const session = await getStripeClient().checkout.sessions.create({
    mode: "subscription",
    client_reference_id: input.customerId,
    customer: input.stripeCustomerId ?? undefined,
    customer_email: input.stripeCustomerId ? undefined : input.customerEmail ?? undefined,
    line_items: [{ price: getPriceIdForPlan(input.plan), quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      customerId: input.customerId,
      plan: input.plan,
      billingCycle: input.billingCycle,
    },
    subscription_data: {
      metadata: {
        customerId: input.customerId,
        plan: input.plan,
        billingCycle: input.billingCycle,
      },
    },
  });

  return session;
};

export const createCustomerPortalSession = async (
  input: CreatePortalSessionInput,
): Promise<Stripe.BillingPortal.Session> =>
  getStripeClient().billingPortal.sessions.create({
    customer: input.stripeCustomerId,
    return_url: input.returnUrl,
  });

export const cancelStripeSubscription = async (
  stripeSubscriptionId: string,
): Promise<Stripe.Subscription> =>
  getStripeClient().subscriptions.cancel(stripeSubscriptionId);

export const constructStripeWebhookEvent = (
  payload: Buffer | string,
  signature: string,
): Stripe.Event =>
  getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    getStripeWebhookSecret(),
  );

export const getWebhookMutations = (event: Stripe.Event): StripeWebhookMutation[] => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") return [];

      return [
        {
          kind: "checkout_completed",
          payload: {
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : null,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            customerId:
              session.metadata?.customerId ??
              (typeof session.client_reference_id === "string"
                ? session.client_reference_id
                : null),
            plan: isSubscriptionPlan(session.metadata?.plan)
              ? session.metadata?.plan
              : null,
            billingCycle: isBillingCycle(session.metadata?.billingCycle)
              ? session.metadata?.billingCycle
              : null,
            amount:
              typeof session.amount_total === "number" ? session.amount_total : null,
          },
        },
      ];
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      return [
        {
          kind: "subscription_upsert",
          snapshot: normalizeStripeSubscription(subscription),
        },
      ];
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubscriptionId =
        typeof invoice.subscription === "string" ? invoice.subscription : null;
      return stripeSubscriptionId
        ? [{ kind: "invoice_payment_failed", stripeSubscriptionId }]
        : [];
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubscriptionId =
        typeof invoice.subscription === "string" ? invoice.subscription : null;
      return stripeSubscriptionId
        ? [{ kind: "invoice_payment_succeeded", stripeSubscriptionId }]
        : [];
    }

    default:
      return [];
  }
};

export { getPlanAmount };
