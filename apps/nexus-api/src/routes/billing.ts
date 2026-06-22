import { Router, type Request, type RequestHandler, type Response } from "express";
import { randomUUID } from "node:crypto";
import {
  PLAN_DEFINITIONS,
  type BillingCycle,
  type CreateSubscriptionInput,
  type Subscription,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type UpdateSubscriptionInput,
} from "../entities/Subscription";

// ---------------------------------------------------------------------------
// NOTE: Stripe integration points are marked with TODO: STRIPE comments.
// Wire up stripe-node calls here once STRIPE_SECRET_KEY is configured.
// ---------------------------------------------------------------------------

type BillingRouterOptions = {
  requireAuth?: RequestHandler;
};

const subscriptions = new Map<string, Subscription>();
// TODO: Replace this in-memory map with persistent storage before production deployment.

const VALID_PLANS: SubscriptionPlan[] = ["starter", "professional", "enterprise"];
const VALID_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "paused",
];
const VALID_CYCLES: BillingCycle[] = ["monthly", "annual"];

const isValidPlan = (v: unknown): v is SubscriptionPlan =>
  typeof v === "string" && VALID_PLANS.includes(v as SubscriptionPlan);

const isValidStatus = (v: unknown): v is SubscriptionStatus =>
  typeof v === "string" && VALID_STATUSES.includes(v as SubscriptionStatus);

const isValidCycle = (v: unknown): v is BillingCycle =>
  typeof v === "string" && VALID_CYCLES.includes(v as BillingCycle);

const isIsoDate = (v: unknown): v is string =>
  typeof v === "string" && !Number.isNaN(Date.parse(v));

const nowIso = () => new Date().toISOString();
const subId = () => `sub_${randomUUID()}`;

const toCreateInput = (body: unknown): CreateSubscriptionInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<CreateSubscriptionInput>;

  if (!c.customerId || typeof c.customerId !== "string") return null;
  if (!isValidPlan(c.plan)) return null;
  if (typeof c.amount !== "number" || c.amount < 0) return null;
  if (!isValidCycle(c.billingCycle)) return null;
  if (!isIsoDate(c.startDate)) return null;

  if (c.status !== undefined && !isValidStatus(c.status)) return null;
  if (c.endDate !== undefined && c.endDate !== null && !isIsoDate(c.endDate)) return null;

  if (
    c.stripeCustomerId !== undefined &&
    c.stripeCustomerId !== null &&
    typeof c.stripeCustomerId !== "string"
  )
    return null;

  if (
    c.stripeSubscriptionId !== undefined &&
    c.stripeSubscriptionId !== null &&
    typeof c.stripeSubscriptionId !== "string"
  )
    return null;

  return {
    customerId: c.customerId,
    plan: c.plan,
    status: c.status,
    amount: c.amount,
    billingCycle: c.billingCycle,
    startDate: c.startDate,
    endDate: c.endDate ?? null,
    stripeCustomerId: c.stripeCustomerId ?? null,
    stripeSubscriptionId: c.stripeSubscriptionId ?? null,
  };
};

const toUpdateInput = (body: unknown): UpdateSubscriptionInput | null => {
  if (!body || typeof body !== "object") return null;

  const c = body as Partial<UpdateSubscriptionInput & { id?: unknown; customerId?: unknown }>;

  if (c.plan !== undefined && !isValidPlan(c.plan)) return null;
  if (c.status !== undefined && !isValidStatus(c.status)) return null;
  if (c.billingCycle !== undefined && !isValidCycle(c.billingCycle)) return null;
  if (c.amount !== undefined && (typeof c.amount !== "number" || c.amount < 0)) return null;
  if (c.endDate !== undefined && c.endDate !== null && !isIsoDate(c.endDate)) return null;

  return {
    plan: c.plan,
    status: c.status,
    amount: c.amount,
    billingCycle: c.billingCycle,
    endDate: c.endDate,
    stripeCustomerId: c.stripeCustomerId,
    stripeSubscriptionId: c.stripeSubscriptionId,
  };
};

/** Resolve a subscription for a given customerId from the in-memory store. */
const findByCustomer = (customerId: string): Subscription | undefined =>
  Array.from(subscriptions.values()).find((s) => s.customerId === customerId);

export const createBillingRouter = (options: BillingRouterOptions = {}): Router => {
  const router = Router();

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  // GET /api/billing/plans — return static plan catalogue
  router.get("/plans", (_req, res) => {
    res.json(PLAN_DEFINITIONS);
  });

  // GET /api/billing/subscription?customerId=xxx — return current subscription
  router.get("/subscription", (req: Request, res: Response) => {
    const { customerId } = req.query;

    if (!customerId || typeof customerId !== "string") {
      res.status(400).json({ error: "customerId query parameter is required" });
      return;
    }

    const subscription = findByCustomer(customerId);
    if (!subscription) {
      res.status(404).json({ error: "No subscription found for this customer" });
      return;
    }

    res.json(subscription);
  });

  // POST /api/billing/checkout — initiate checkout session
  router.post("/checkout", (req: Request, res: Response) => {
    // TODO: STRIPE — create a Stripe Checkout Session here:
    //   const session = await stripe.checkout.sessions.create({ ... })
    //   return res.json({ url: session.url });
    //
    // For now, create a local subscription record as a stub.

    const input = toCreateInput(req.body);
    if (!input) {
      res.status(400).json({ error: "Invalid checkout payload" });
      return;
    }

    const existing = findByCustomer(input.customerId);
    if (existing && existing.status === "active") {
      res.status(409).json({ error: "Customer already has an active subscription" });
      return;
    }

    const createdAt = nowIso();
    const subscription: Subscription = {
      id: subId(),
      customerId: input.customerId,
      plan: input.plan,
      status: input.status ?? "trialing",
      amount: input.amount,
      billingCycle: input.billingCycle,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      createdAt,
      updatedAt: createdAt,
    };

    subscriptions.set(subscription.id, subscription);

    res.status(201).json({
      subscription,
      // TODO: STRIPE — replace with Stripe Checkout URL
      checkoutUrl: null,
      message: "Subscription created. Wire up Stripe to redirect to hosted checkout.",
    });
  });

  // POST /api/billing/cancel — cancel a subscription
  router.post("/cancel", (req: Request, res: Response) => {
    const body = req.body as { customerId?: unknown; subscriptionId?: unknown };

    const customerId =
      typeof body.customerId === "string" ? body.customerId : undefined;
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId : undefined;

    const subscription = subscriptionId
      ? subscriptions.get(subscriptionId)
      : customerId
        ? findByCustomer(customerId)
        : undefined;

    if (!subscription) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    if (subscription.status === "canceled") {
      res.status(409).json({ error: "Subscription is already canceled" });
      return;
    }

    // TODO: STRIPE — call stripe.subscriptions.cancel(subscription.stripeSubscriptionId)

    const canceled: Subscription = {
      ...subscription,
      status: "canceled",
      endDate: nowIso(),
      updatedAt: nowIso(),
    };

    subscriptions.set(canceled.id, canceled);
    res.json(canceled);
  });

  // POST /api/billing/webhook — receive Stripe webhook events
  router.post("/webhook", (req: Request, res: Response) => {
    // TODO: STRIPE — verify webhook signature:
    //   const sig = req.headers['stripe-signature'];
    //   const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    //
    // Then handle relevant event types:
    //   customer.subscription.updated → update status/plan in subscriptions map
    //   customer.subscription.deleted → mark subscription as canceled
    //   invoice.payment_failed → mark subscription as past_due
    //   checkout.session.completed → activate trialing subscription

    const event = req.body as { type?: string; data?: { object?: unknown } };

    if (!event.type) {
      res.status(400).json({ error: "Missing event type" });
      return;
    }

    // Acknowledge receipt — real processing happens after Stripe wiring
    res.json({ received: true, type: event.type });
  });

  return router;
};

export default createBillingRouter;
