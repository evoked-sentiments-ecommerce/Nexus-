export type PackageReadyInput = {
  recipientName: string;
  recipientEmail: string;
  packageId: string;
  packageName: string;
  packageType: string;
  projectId: string;
  downloadUrl: string;
  assetCount?: number;
  packageUrl?: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const DEFAULT_APP_URL = "https://app.nexus.com";

const formatPackageType = (packageType: string): string => {
  const labels: Record<string, string> = {
    startup: "Startup",
    brand: "Brand",
    operations: "Operations",
    training: "Training",
    hospitality_blueprint: "Hospitality Blueprint",
    executive: "Executive",
  };

  return labels[packageType] ?? packageType;
};

export const buildPackageReadyEmail = (input: PackageReadyInput): EmailTemplate => {
  const appUrl = input.packageUrl ?? `${DEFAULT_APP_URL}/packages/${input.packageId}`;
  const typeLabel = formatPackageType(input.packageType);
  const assetNote =
    input.assetCount !== undefined
      ? ` containing ${input.assetCount} asset${input.assetCount === 1 ? "" : "s"}`
      : "";

  const subject = `Your ${typeLabel} Package is Ready — ${input.packageName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px;">
  <h1 style="color:#0f172a;font-size:22px;margin-bottom:8px;">Your Package is Ready</h1>
  <p style="font-size:16px;line-height:1.6;">Hi ${input.recipientName},</p>
  <p style="font-size:16px;line-height:1.6;">
    Your <strong>${typeLabel}</strong> package <em>&ldquo;${input.packageName}&rdquo;</em>
    has been assembled${assetNote} and is ready to download.
  </p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 0;color:#64748b;">Package</td>
      <td style="padding:8px 0;text-align:right;font-weight:600;">${input.packageName}</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 0;color:#64748b;">Type</td>
      <td style="padding:8px 0;text-align:right;">${typeLabel}</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 0;color:#64748b;">Package ID</td>
      <td style="padding:8px 0;text-align:right;font-family:monospace;">${input.packageId}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#64748b;">Project ID</td>
      <td style="padding:8px 0;text-align:right;font-family:monospace;">${input.projectId}</td>
    </tr>
  </table>
  <p style="margin:32px 0 16px;">
    <a href="${input.downloadUrl}"
       style="background:#0f172a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">
      Download Package
    </a>
  </p>
  <p style="margin:0 0 32px;">
    <a href="${appUrl}"
       style="color:#0f172a;font-size:14px;text-decoration:underline;">
      View in Nexus
    </a>
  </p>
  <p style="font-size:14px;color:#64748b;line-height:1.6;">
    Download links may expire. Visit the Nexus platform to regenerate your package at any time.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
  <p style="font-size:12px;color:#94a3b8;">Nexus &mdash; Package Engine</p>
</body>
</html>`;

  const text = [
    `Your Package is Ready — ${input.packageName}`,
    "",
    `Hi ${input.recipientName},`,
    "",
    `Your ${typeLabel} package "${input.packageName}" has been assembled${assetNote} and is ready to download.`,
    "",
    `Package:    ${input.packageName}`,
    `Type:       ${typeLabel}`,
    `Package ID: ${input.packageId}`,
    `Project ID: ${input.projectId}`,
    "",
    `Download: ${input.downloadUrl}`,
    `View in Nexus: ${appUrl}`,
    "",
    "Download links may expire. Visit the Nexus platform to regenerate your package at any time.",
    "",
    "Nexus — Package Engine",
  ].join("\n");

  return { subject, html, text };
};
