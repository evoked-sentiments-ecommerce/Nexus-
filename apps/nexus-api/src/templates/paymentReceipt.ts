export type PaymentReceiptInput = {
  recipientName: string;
  recipientEmail: string;
  plan: string;
  billingCycle: string;
  amount: number;
  currency?: string;
  subscriptionId: string;
  paymentDate?: string;
  billingPortalUrl?: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const DEFAULT_BILLING_PORTAL_URL = "https://app.nexus.com/billing";

const formatAmount = (amount: number, currency: string): string => {
  const dollars = (amount / 100).toFixed(2);
  return `${currency.toUpperCase()} $${dollars}`;
};

export const buildPaymentReceiptEmail = (input: PaymentReceiptInput): EmailTemplate => {
  const currency = input.currency ?? "usd";
  const billingPortalUrl = input.billingPortalUrl ?? DEFAULT_BILLING_PORTAL_URL;
  const planLabel = input.plan.charAt(0).toUpperCase() + input.plan.slice(1);
  const cycleLabel = input.billingCycle === "annual" ? "Annual" : "Monthly";
  const formattedAmount = formatAmount(input.amount, currency);
  const paymentDate = input.paymentDate ?? new Date().toISOString().split("T")[0];

  const subject = `Nexus Payment Receipt — ${planLabel} ${cycleLabel}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px;">
  <h1 style="color:#0f172a;font-size:22px;margin-bottom:8px;">Payment Receipt</h1>
  <p style="font-size:16px;line-height:1.6;">Hi ${input.recipientName},</p>
  <p style="font-size:16px;line-height:1.6;">
    Thank you for your payment. Here is a summary of your transaction.
  </p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;">
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 0;color:#64748b;">Plan</td>
      <td style="padding:10px 0;text-align:right;font-weight:600;">${planLabel}</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 0;color:#64748b;">Billing Cycle</td>
      <td style="padding:10px 0;text-align:right;">${cycleLabel}</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 0;color:#64748b;">Amount Paid</td>
      <td style="padding:10px 0;text-align:right;font-weight:600;">${formattedAmount}</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 0;color:#64748b;">Payment Date</td>
      <td style="padding:10px 0;text-align:right;">${paymentDate}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#64748b;">Subscription ID</td>
      <td style="padding:10px 0;text-align:right;font-family:monospace;font-size:13px;">${input.subscriptionId}</td>
    </tr>
  </table>
  <p style="margin:32px 0;">
    <a href="${billingPortalUrl}"
       style="background:#0f172a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">
      Manage Billing
    </a>
  </p>
  <p style="font-size:14px;color:#64748b;line-height:1.6;">
    Keep this email as your receipt. If you have billing questions, reply to this email.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
  <p style="font-size:12px;color:#94a3b8;">Nexus &mdash; Powered by hospitality intelligence</p>
</body>
</html>`;

  const text = [
    `Payment Receipt — ${planLabel} ${cycleLabel}`,
    "",
    `Hi ${input.recipientName},`,
    "",
    "Thank you for your payment. Here is a summary of your transaction:",
    "",
    `Plan:            ${planLabel}`,
    `Billing Cycle:   ${cycleLabel}`,
    `Amount Paid:     ${formattedAmount}`,
    `Payment Date:    ${paymentDate}`,
    `Subscription ID: ${input.subscriptionId}`,
    "",
    `Manage billing: ${billingPortalUrl}`,
    "",
    "Keep this email as your receipt.",
    "",
    "Nexus — Powered by hospitality intelligence",
  ].join("\n");

  return { subject, html, text };
};
