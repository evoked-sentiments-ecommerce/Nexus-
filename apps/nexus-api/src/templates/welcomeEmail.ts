export type WelcomeEmailInput = {
  recipientName: string;
  recipientEmail: string;
  plan: string;
  dashboardUrl?: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const DEFAULT_DASHBOARD_URL = "https://app.nexus.com/dashboard";

export const buildWelcomeEmail = (input: WelcomeEmailInput): EmailTemplate => {
  const dashboardUrl = input.dashboardUrl ?? DEFAULT_DASHBOARD_URL;
  const planLabel = input.plan.charAt(0).toUpperCase() + input.plan.slice(1);

  const subject = `Welcome to Nexus, ${input.recipientName}!`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px;">
  <h1 style="color:#0f172a;font-size:24px;margin-bottom:8px;">Welcome to Nexus</h1>
  <p style="font-size:16px;line-height:1.6;">Hi ${input.recipientName},</p>
  <p style="font-size:16px;line-height:1.6;">
    Your <strong>${planLabel}</strong> account is ready. You now have access to the full
    Nexus platform — from project management and brand strategy to hospitality blueprints
    and automated document packages.
  </p>
  <p style="margin:32px 0;">
    <a href="${dashboardUrl}"
       style="background:#0f172a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">
      Go to Dashboard
    </a>
  </p>
  <p style="font-size:14px;color:#64748b;line-height:1.6;">
    If you have questions, reply to this email and the Nexus team will be happy to help.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
  <p style="font-size:12px;color:#94a3b8;">Nexus &mdash; Powered by hospitality intelligence</p>
</body>
</html>`;

  const text = [
    `Welcome to Nexus, ${input.recipientName}!`,
    "",
    `Your ${planLabel} account is ready. You now have access to the full Nexus platform.`,
    "",
    `Go to your dashboard: ${dashboardUrl}`,
    "",
    "If you have questions, reply to this email.",
    "",
    "Nexus — Powered by hospitality intelligence",
  ].join("\n");

  return { subject, html, text };
};
