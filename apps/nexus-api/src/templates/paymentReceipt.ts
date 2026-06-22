export interface PaymentReceiptData {
  customerName: string;
  customerEmail: string;
  invoiceId: string;
  planName: string;
  amount: number;
  currency: string;
  paidAt: Date;
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  receiptUrl?: string;
}

export function paymentReceiptSubject(data: PaymentReceiptData): string {
  return `Payment Receipt – ${data.planName} (Invoice #${data.invoiceId})`;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function paymentReceiptHtml(data: PaymentReceiptData): string {
  const {
    customerName,
    invoiceId,
    planName,
    amount,
    currency,
    paidAt,
    billingPeriodStart,
    billingPeriodEnd,
    receiptUrl,
  } = data;

  const billingPeriodRow =
    billingPeriodStart && billingPeriodEnd
      ? `<tr>
          <td style="padding:10px 0;color:#6b7280;font-size:14px;">Billing Period</td>
          <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;">${formatDate(billingPeriodStart)} – ${formatDate(billingPeriodEnd)}</td>
        </tr>`
      : "";

  const receiptButton = receiptUrl
    ? `<a href="${receiptUrl}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">View Full Receipt</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 48px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Payment Confirmed</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Thank you for your payment</p>
    </div>
    <div style="padding:40px 48px;">
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">Hi ${customerName}, your payment was processed successfully.</p>

      <div style="background:#f9fafb;border-radius:8px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">Invoice</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">#${invoiceId}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">Plan</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${planName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">Date</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${formatDate(paidAt)}</td>
          </tr>
          ${billingPeriodRow}
          <tr>
            <td style="padding:14px 0 0;color:#111827;font-size:16px;font-weight:700;">Total</td>
            <td style="padding:14px 0 0;color:#6366f1;font-size:20px;font-weight:700;text-align:right;">${formatCurrency(amount, currency)}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">If you have questions about this charge, please contact our support team.</p>
      ${receiptButton}
    </div>
    <div style="padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:13px;">© ${new Date().getFullYear()} Nexus. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function paymentReceiptText(data: PaymentReceiptData): string {
  const { customerName, invoiceId, planName, amount, currency, paidAt, receiptUrl } = data;
  const lines = [
    `Hi ${customerName},`,
    "",
    "Your payment was processed successfully.",
    "",
    `Invoice:  #${invoiceId}`,
    `Plan:     ${planName}`,
    `Date:     ${formatDate(paidAt)}`,
    `Amount:   ${formatCurrency(amount, currency)}`,
  ];
  if (receiptUrl) {
    lines.push("", `View receipt: ${receiptUrl}`);
  }
  lines.push("", "The Nexus Team");
  return lines.join("\n");
}
