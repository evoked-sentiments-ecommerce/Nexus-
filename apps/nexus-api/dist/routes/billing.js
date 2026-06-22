"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events and triggers billing emails.
 */
router.post("/webhook", async (req, res) => {
    try {
        const event = req.body;
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object;
            const metadata = paymentIntent.metadata ?? {};
            await (0, emailService_1.sendPaymentReceipt)({
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});
/**
 * POST /api/billing/receipt
 * Manually trigger a payment receipt email.
 */
router.post("/receipt", async (req, res) => {
    try {
        const result = await (0, emailService_1.sendPaymentReceipt)({
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: message });
    }
});
exports.default = router;
//# sourceMappingURL=billing.js.map