export type BlueprintReadyInput = {
  recipientName: string;
  recipientEmail: string;
  blueprintId: string;
  blueprintTitle: string;
  blueprintType: string;
  projectId: string;
  generatedSections?: string[];
  blueprintUrl?: string;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

const DEFAULT_APP_URL = "https://app.nexus.com";

const formatBlueprintType = (blueprintType: string): string => {
  const labels: Record<string, string> = {
    restaurant: "Restaurant",
    hotel_fb: "Hotel F&B",
    resort: "Resort",
    private_club: "Private Club",
    catering: "Catering",
    executive_advisory: "Executive Advisory",
  };

  return labels[blueprintType] ?? blueprintType;
};

export const buildBlueprintReadyEmail = (input: BlueprintReadyInput): EmailTemplate => {
  const appUrl = input.blueprintUrl ?? `${DEFAULT_APP_URL}/chef-drew/${input.blueprintId}`;
  const typeLabel = formatBlueprintType(input.blueprintType);
  const sections = input.generatedSections ?? [];

  const subject = `Your ${typeLabel} Blueprint is Ready — ${input.blueprintTitle}`;

  const sectionsHtml =
    sections.length > 0
      ? `<ul style="padding-left:20px;margin:16px 0;">
          ${sections.map((s) => `<li style="font-size:15px;line-height:1.8;color:#334155;">${s}</li>`).join("\n          ")}
        </ul>`
      : "";

  const sectionsTxt =
    sections.length > 0 ? ["", "Generated sections:", ...sections.map((s) => `  • ${s}`)].join("\n") : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px;">
  <h1 style="color:#0f172a;font-size:22px;margin-bottom:8px;">Your Blueprint is Ready</h1>
  <p style="font-size:16px;line-height:1.6;">Hi ${input.recipientName},</p>
  <p style="font-size:16px;line-height:1.6;">
    Your <strong>${typeLabel}</strong> hospitality blueprint <em>&ldquo;${input.blueprintTitle}&rdquo;</em>
    has been generated and is ready to review.
  </p>
  ${
    sectionsHtml
      ? `<p style="font-size:15px;font-weight:600;margin-bottom:4px;">Generated sections:</p>${sectionsHtml}`
      : ""
  }
  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 0;color:#64748b;">Blueprint ID</td>
      <td style="padding:8px 0;text-align:right;font-family:monospace;">${input.blueprintId}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#64748b;">Project ID</td>
      <td style="padding:8px 0;text-align:right;font-family:monospace;">${input.projectId}</td>
    </tr>
  </table>
  <p style="margin:32px 0;">
    <a href="${appUrl}"
       style="background:#0f172a;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">
      View Blueprint
    </a>
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
  <p style="font-size:12px;color:#94a3b8;">Nexus &mdash; Chef Drew Engine</p>
</body>
</html>`;

  const text = [
    `Your Blueprint is Ready — ${input.blueprintTitle}`,
    "",
    `Hi ${input.recipientName},`,
    "",
    `Your ${typeLabel} hospitality blueprint "${input.blueprintTitle}" has been generated and is ready to review.`,
    sectionsTxt,
    "",
    `Blueprint ID: ${input.blueprintId}`,
    `Project ID:   ${input.projectId}`,
    "",
    `View blueprint: ${appUrl}`,
    "",
    "Nexus — Chef Drew Engine",
  ].join("\n");

  return { subject, html, text };
};
