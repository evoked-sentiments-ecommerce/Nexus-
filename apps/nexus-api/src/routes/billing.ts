import { Router, Request, Response } from "express";
import { sendPaymentReceipt } from "../services/emailService";

const router = Router();

/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events and triggers billing emails.
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const event = req.body;

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata ?? {};

      await sendPaymentReceipt({
        customerName: metadata.customerName ?? "Valued Customer",
        customerEmail: metadata.customerEmail,
        invoiceId: paymentIntent.id,
        planName: metadata.planName ?? "Nexus Plan",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paidAt: new Date(paymentIntent.created * 1000),
        receiptUrl: metadata.receiptUrl,
      });
    }

    res.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/billing/receipt
 * Manually trigger a payment receipt email.
 */
router.post("/receipt", async (req: Request, res: Response) => {
  try {
    const result = await sendPaymentReceipt({
      ...req.body,
      paidAt: new Date(req.body.paidAt),
      billingPeriodStart: req.body.billingPeriodStart
        ? new Date(req.body.billingPeriodStart)
        : undefined,
      billingPeriodEnd: req.body.billingPeriodEnd
        ? new Date(req.body.billingPeriodEnd)
        : undefined,
    });
    res.json({ success: true, emailId: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
