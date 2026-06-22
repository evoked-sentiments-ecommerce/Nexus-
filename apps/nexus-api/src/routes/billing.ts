import { randomUUID } from "node:crypto";
import { Router, raw, type Request, type RequestHandler, type Response } from "express";
import { withTransaction } from "../database/connection";
import { SubscriptionRepository } from "../database/repositories";
import {
  PLAN_DEFINITIONS,
  type BillingCycle,
  type Subscription,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from "../entities/Subscription";
import {
  cancelStripeSubscription,
  constructStripeWebhookEvent,
  createCheckoutSession,
  createCustomerPortalSession,
  getPlanAmount,
  getWebhookMutations,
  type CheckoutCompletionPayload,
  type StripeSubscriptionSnapshot,
} from "../services/stripeService";

type BillingRouterOptions = {
  requireAuth?: RequestHandler;
};

type CheckoutRequestInput = {
  customerId: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId: string | null;
  customerEmail: string | null;
};

const subscriptionRepository = new SubscriptionRepository();

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

const isValidUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const nowIso = () => new Date().toISOString();
const subId = () => `sub_${randomUUID()}`;

const resolveBaseUrl = (req: Request): string =>
  req.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";

const findByCustomer = (repo: SubscriptionRepository, customerId: string) =>
  repo.findByCustomerId(customerId);

const findByStripeSubscriptionId = (repo: SubscriptionRepository, stripeSubscriptionId: string) =>
  repo.findByStripeSubscriptionId(stripeSubscriptionId);

const findByStripeCustomerId = (repo: SubscriptionRepository, stripeCustomerId: string) =>
  repo.findByStripeCustomerId(stripeCustomerId);

const createOrUpdateSubscription = async (
  repo: SubscriptionRepository,
  base: Partial<Subscription> &
    Pick<Subscription, "customerId" | "plan" | "billingCycle" | "amount"> & {
      status?: SubscriptionStatus;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
      startDate?: string;
      endDate?: string | null;
    },
  existing?: Subscription | null,
): Promise<Subscription> => {
  const timestamp = nowIso();
  const next: Subscription = {
    id: existing?.id ?? subId(),
    customerId: base.customerId,
    plan: base.plan,
    status: base.status ?? existing?.status ?? "incomplete",
    amount: base.amount,
    billingCycle: base.billingCycle,
    startDate: base.startDate ?? existing?.startDate ?? timestamp,
    endDate:
      base.endDate !== undefined ? base.endDate : (existing?.endDate ?? null),
    stripeCustomerId:
      base.stripeCustomerId !== undefined
        ? base.stripeCustomerId
        : (existing?.stripeCustomerId ?? null),
    stripeSubscriptionId:
      base.stripeSubscriptionId !== undefined
        ? base.stripeSubscriptionId
        : (existing?.stripeSubscriptionId ?? null),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  return repo.save(next);
};

const toCheckoutInput = (req: Request): CheckoutRequestInput | null => {
  if (!req.body || typeof req.body !== "object") return null;
  const body = req.body as Record<string, unknown>;

  if (typeof body.customerId !== "string") return null;
  if (!isValidPlan(body.plan)) return null;

  const billingCycle = isValidCycle(body.billingCycle) ? body.billingCycle : "monthly";
  const baseUrl = resolveBaseUrl(req);

  const defaultSuccessUrl = `${baseUrl}/billing?checkout=success`;
  const defaultCancelUrl = `${baseUrl}/billing?checkout=cancel`;

  const successUrl =
    body.successUrl === undefined ? defaultSuccessUrl : body.successUrl;
  const cancelUrl = body.cancelUrl === undefined ? defaultCancelUrl : body.cancelUrl;

  if (!isValidUrl(successUrl) || !isValidUrl(cancelUrl)) return null;

  if (
    body.stripeCustomerId !== undefined &&
    body.stripeCustomerId !== null &&
    typeof body.stripeCustomerId !== "string"
  ) {
    return null;
  }

  if (
    body.customerEmail !== undefined &&
    body.customerEmail !== null &&
    typeof body.customerEmail !== "string"
  ) {
    return null;
  }

  return {
    customerId: body.customerId,
    plan: body.plan,
    billingCycle,
    successUrl,
    cancelUrl,
    stripeCustomerId:
      typeof body.stripeCustomerId === "string" ? body.stripeCustomerId : null,
    customerEmail:
      typeof body.customerEmail === "string" ? body.customerEmail : null,
  };
};

const applySnapshot = async (
  repo: SubscriptionRepository,
  snapshot: StripeSubscriptionSnapshot,
): Promise<Subscription> => {
  const existing =
    (await findByStripeSubscriptionId(repo, snapshot.stripeSubscriptionId)) ??
    (snapshot.customerId ? await findByCustomer(repo, snapshot.customerId) : null) ??
    (snapshot.stripeCustomerId
      ? await findByStripeCustomerId(repo, snapshot.stripeCustomerId)
      : null);

  const customerId =
    snapshot.customerId ??
    existing?.customerId ??
    `stripe_customer_${snapshot.stripeCustomerId ?? randomUUID()}`;

  return createOrUpdateSubscription(
    repo,
    {
      customerId,
      plan: snapshot.plan,
      status: snapshot.status,
      amount: snapshot.amount,
      billingCycle: snapshot.billingCycle,
      startDate: snapshot.startDate,
      endDate: snapshot.endDate,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
    },
    existing,
  );
};

const applyCheckoutCompletion = async (
  repo: SubscriptionRepository,
  payload: CheckoutCompletionPayload,
): Promise<Subscription | null> => {
  const existing =
    (payload.stripeSubscriptionId
      ? await findByStripeSubscriptionId(repo, payload.stripeSubscriptionId)
      : null) ??
    (payload.customerId ? await findByCustomer(repo, payload.customerId) : null) ??
    (payload.stripeCustomerId
      ? await findByStripeCustomerId(repo, payload.stripeCustomerId)
      : null);

  const plan = payload.plan ?? existing?.plan;
  const billingCycle = payload.billingCycle ?? existing?.billingCycle;
  const customerId = payload.customerId ?? existing?.customerId;

  if (!plan || !billingCycle || !customerId) {
    return existing ?? null;
  }

  const amount = payload.amount ?? existing?.amount ?? getPlanAmount(plan, billingCycle);

  return createOrUpdateSubscription(
    repo,
    {
      customerId,
      plan,
      status: "active",
      amount,
      billingCycle,
      stripeCustomerId:
        payload.stripeCustomerId ?? existing?.stripeCustomerId ?? null,
      stripeSubscriptionId:
        payload.stripeSubscriptionId ?? existing?.stripeSubscriptionId ?? null,
      startDate: existing?.startDate ?? nowIso(),
    },
    existing,
  );
};

const updateStatusByStripeSubscription = async (
  repo: SubscriptionRepository,
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
): Promise<Subscription | null> => {
  if (!isValidStatus(status)) return null;

  const existing = await findByStripeSubscriptionId(repo, stripeSubscriptionId);
  if (!existing) return null;

  return createOrUpdateSubscription(
    repo,
    {
      customerId: existing.customerId,
      plan: existing.plan,
      status,
      amount: existing.amount,
      billingCycle: existing.billingCycle,
      startDate: existing.startDate,
      endDate: status === "canceled" ? nowIso() : existing.endDate,
      stripeCustomerId: existing.stripeCustomerId,
      stripeSubscriptionId: existing.stripeSubscriptionId,
    },
    existing,
  );
};

export const createBillingRouter = (options: BillingRouterOptions = {}): Router => {
  const router = Router();

  router.post("/webhook", raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    const payload = req.body;
    if (!Buffer.isBuffer(payload) && typeof payload !== "string") {
      res.status(400).json({
        error:
          "Webhook payload must be raw body (Buffer or string) for Stripe signature verification",
      });
      return;
    }

    try {
      const event = constructStripeWebhookEvent(payload, signature);
      const mutations = getWebhookMutations(event);

      await withTransaction(async (client) => {
        const repo = new SubscriptionRepository(client);

        for (const mutation of mutations) {
          switch (mutation.kind) {
            case "subscription_upsert":
              await applySnapshot(repo, mutation.snapshot);
              break;
            case "checkout_completed":
              await applyCheckoutCompletion(repo, mutation.payload);
              break;
            case "invoice_payment_failed":
              await updateStatusByStripeSubscription(
                repo,
                mutation.stripeSubscriptionId,
                "past_due",
              );
              break;
            case "invoice_payment_succeeded": {
              const current = await findByStripeSubscriptionId(
                repo,
                mutation.stripeSubscriptionId,
              );
              if (
                current &&
                (current.status === "past_due" || current.status === "incomplete")
              ) {
                await updateStatusByStripeSubscription(
                  repo,
                  mutation.stripeSubscriptionId,
                  "active",
                );
              }
              break;
            }
            default:
              break;
          }
        }
      });

      res.json({ received: true, type: event.type });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid webhook";
      res.status(400).json({ error: message });
    }
  });

  if (options.requireAuth) {
    router.use(options.requireAuth);
  }

  router.get("/plans", (_req, res) => {
    res.json(PLAN_DEFINITIONS);
  });

  router.get("/subscription", async (req: Request, res: Response) => {
    const { customerId } = req.query;

    if (!customerId || typeof customerId !== "string") {
      res.status(400).json({ error: "customerId query parameter is required" });
      return;
    }

    let subscription: Subscription | null = null;
    try {
      subscription = await findByCustomer(subscriptionRepository, customerId);
    } catch {
      res.status(500).json({ error: "Failed to fetch subscription" });
      return;
    }
    if (!subscription) {
      res.status(404).json({ error: "No subscription found for this customer" });
      return;
    }

    res.json(subscription);
  });

  router.post("/checkout", async (req: Request, res: Response) => {
    const input = toCheckoutInput(req);
    if (!input) {
      res.status(400).json({ error: "Invalid checkout payload" });
      return;
    }

    let existing: Subscription | null = null;
    try {
      existing = await findByCustomer(subscriptionRepository, input.customerId);
    } catch {
      res.status(500).json({ error: "Failed to fetch subscription" });
      return;
    }
    if (existing && existing.status === "active") {
      res.status(409).json({ error: "Customer already has an active subscription" });
      return;
    }

    try {
      const session = await createCheckoutSession({
        customerId: input.customerId,
        plan: input.plan,
        billingCycle: input.billingCycle,
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        stripeCustomerId: input.stripeCustomerId,
        customerEmail: input.customerEmail,
      });

      const amount = getPlanAmount(input.plan, input.billingCycle);
      const provisional = await createOrUpdateSubscription(
        subscriptionRepository,
        {
          customerId: input.customerId,
          plan: input.plan,
          status: "incomplete",
          amount,
          billingCycle: input.billingCycle,
          startDate: nowIso(),
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : input.stripeCustomerId,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
        },
        existing,
      );

      res.status(201).json({
        checkoutSessionId: session.id,
        checkoutUrl: session.url,
        subscription: provisional,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create checkout";
      res.status(400).json({ error: message });
    }
  });

  router.post("/portal", async (req: Request, res: Response) => {
    const body = req.body as
      | {
          customerId?: unknown;
          stripeCustomerId?: unknown;
          returnUrl?: unknown;
        }
      | undefined;

    const customerId = typeof body?.customerId === "string" ? body.customerId : null;
    const directStripeCustomerId =
      typeof body?.stripeCustomerId === "string" ? body.stripeCustomerId : null;

    let subscription: Subscription | null = null;
    let fallback: Subscription | null = null;
    try {
      subscription = directStripeCustomerId
        ? await findByStripeCustomerId(subscriptionRepository, directStripeCustomerId)
        : null;
      fallback = customerId
        ? await findByCustomer(subscriptionRepository, customerId)
        : null;
    } catch {
      res.status(500).json({ error: "Failed to resolve subscription customer" });
      return;
    }

    const stripeCustomerId =
      directStripeCustomerId ?? subscription?.stripeCustomerId ?? fallback?.stripeCustomerId;

    if (!stripeCustomerId) {
      res.status(404).json({ error: "Stripe customer not found for portal session" });
      return;
    }

    const returnUrl =
      isValidUrl(body?.returnUrl) ? body.returnUrl : `${resolveBaseUrl(req)}/billing`;

    try {
      const portalSession = await createCustomerPortalSession({
        stripeCustomerId,
        returnUrl,
      });

      res.json({ url: portalSession.url });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create customer portal session";
      res.status(400).json({ error: message });
    }
  });

  router.post("/cancel", async (req: Request, res: Response) => {
    const body = req.body as { customerId?: unknown; subscriptionId?: unknown };

    const customerId =
      typeof body.customerId === "string" ? body.customerId : undefined;
    const subscriptionId =
      typeof body.subscriptionId === "string" ? body.subscriptionId : undefined;

    let subscription: Subscription | null = null;
    try {
      subscription = subscriptionId
        ? await subscriptionRepository.findById(subscriptionId)
        : customerId
          ? await findByCustomer(subscriptionRepository, customerId)
          : null;
    } catch {
      res.status(500).json({ error: "Failed to fetch subscription" });
      return;
    }

    if (!subscription) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    if (subscription.status === "canceled") {
      res.status(409).json({ error: "Subscription is already canceled" });
      return;
    }

    try {
      let cancellationDate = nowIso();
      if (subscription.stripeSubscriptionId) {
        const canceled = await cancelStripeSubscription(subscription.stripeSubscriptionId);
        const canceledAt = canceled.canceled_at ?? canceled.current_period_end;
        if (typeof canceledAt === "number") {
          cancellationDate = new Date(canceledAt * 1000).toISOString();
        }
      }

      const canceled = await createOrUpdateSubscription(
        subscriptionRepository,
        {
          customerId: subscription.customerId,
          plan: subscription.plan,
          status: "canceled",
          amount: subscription.amount,
          billingCycle: subscription.billingCycle,
          startDate: subscription.startDate,
          endDate: cancellationDate,
          stripeCustomerId: subscription.stripeCustomerId,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        },
        subscription,
      );

      res.json(canceled);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel subscription";
      res.status(400).json({ error: message });
    }
  });

  return router;
};

export default createBillingRouter;
