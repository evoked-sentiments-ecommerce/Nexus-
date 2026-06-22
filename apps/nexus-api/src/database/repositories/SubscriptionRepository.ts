import type { Subscription } from "../../entities/Subscription";
import { getPool, type QueryExecutor } from "../connection";
import { toIsoString, toNullableIsoString, toNullableString } from "./helpers";

type SubscriptionRow = {
  id: string;
  customer_id: string;
  plan: Subscription["plan"];
  status: Subscription["status"];
  amount: number;
  billing_cycle: Subscription["billingCycle"];
  start_date: string | Date;
  end_date: string | Date | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

const mapRow = (row: SubscriptionRow): Subscription => ({
  id: row.id,
  customerId: row.customer_id,
  plan: row.plan,
  status: row.status,
  amount: row.amount,
  billingCycle: row.billing_cycle,
  startDate: toIsoString(row.start_date),
  endDate: toNullableIsoString(row.end_date),
  stripeCustomerId: toNullableString(row.stripe_customer_id),
  stripeSubscriptionId: toNullableString(row.stripe_subscription_id),
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export class SubscriptionRepository {
  constructor(private readonly db: QueryExecutor = getPool()) {}

  async findById(id: string): Promise<Subscription | null> {
    const result = await this.db.query<SubscriptionRow>(
      "SELECT * FROM subscriptions WHERE id = $1",
      [id],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByCustomerId(customerId: string): Promise<Subscription | null> {
    const result = await this.db.query<SubscriptionRow>(
      "SELECT * FROM subscriptions WHERE customer_id = $1",
      [customerId],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    const result = await this.db.query<SubscriptionRow>(
      "SELECT * FROM subscriptions WHERE stripe_subscription_id = $1",
      [stripeSubscriptionId],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    const result = await this.db.query<SubscriptionRow>(
      "SELECT * FROM subscriptions WHERE stripe_customer_id = $1",
      [stripeCustomerId],
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const result = await this.db.query<SubscriptionRow>(
      `INSERT INTO subscriptions
      (id, customer_id, plan, status, amount, billing_cycle, start_date, end_date, stripe_customer_id, stripe_subscription_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id)
      DO UPDATE SET
        customer_id = EXCLUDED.customer_id,
        plan = EXCLUDED.plan,
        status = EXCLUDED.status,
        amount = EXCLUDED.amount,
        billing_cycle = EXCLUDED.billing_cycle,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        updated_at = EXCLUDED.updated_at
      RETURNING *`,
      [
        subscription.id,
        subscription.customerId,
        subscription.plan,
        subscription.status,
        subscription.amount,
        subscription.billingCycle,
        subscription.startDate,
        subscription.endDate,
        subscription.stripeCustomerId,
        subscription.stripeSubscriptionId,
        subscription.createdAt,
        subscription.updatedAt,
      ],
    );

    return mapRow(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query("DELETE FROM subscriptions WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
