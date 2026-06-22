"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueprintReadySubject = blueprintReadySubject;
exports.blueprintReadyHtml = blueprintReadyHtml;
exports.blueprintReadyText = blueprintReadyText;
function blueprintReadySubject(data) {
    return `Your Blueprint is Ready – ${data.blueprintTitle}`;
}
function formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
function blueprintReadyHtml(data) {
    const { customerName, blueprintTitle, blueprintId, conceptType, cuisineType, createdAt, viewUrl, downloadUrl, } = data;
    const cuisineRow = cuisineType
        ? `<tr>
        <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #e5e7eb;">Cuisine Type</td>
        <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #e5e7eb;">${cuisineType}</td>
      </tr>`
        : "";
    const downloadButton = downloadUrl
        ? `<a href="${downloadUrl}" style="display:inline-block;margin-left:12px;padding:12px 24px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Download PDF</a>`
        : "";
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blueprint Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);padding:40px 48px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🍽️</div>
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Blueprint Ready</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Chef Drew has finished your hospitality blueprint</p>
    </div>
    <div style="padding:40px 48px;">
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        Hi ${customerName}, great news! Your hospitality blueprint <strong>${blueprintTitle}</strong> has been generated and is ready to view.
      </p>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #fde68a;">Blueprint ID</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #fde68a;font-family:monospace;">${blueprintId}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #fde68a;">Concept Type</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #fde68a;">${conceptType}</td>
          </tr>
          ${cuisineRow}
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;">Generated</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;">${formatDate(createdAt)}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.6;">
        Your blueprint includes menu recommendations, operational guidelines, staffing suggestions, and branding concepts tailored to your concept.
      </p>

      <div>
        <a href="${viewUrl}" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">View Blueprint</a>
        ${downloadButton}
      </div>
    </div>
    <div style="padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:13px;">© ${new Date().getFullYear()} Nexus. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
function blueprintReadyText(data) {
    const { customerName, blueprintTitle, blueprintId, conceptType, cuisineType, createdAt, viewUrl, downloadUrl } = data;
    const lines = [
        `Hi ${customerName},`,
        "",
        `Your hospitality blueprint "${blueprintTitle}" is ready!`,
        "",
        `Blueprint ID:  ${blueprintId}`,
        `Concept Type:  ${conceptType}`,
    ];
    if (cuisineType)
        lines.push(`Cuisine Type:  ${cuisineType}`);
    lines.push(`Generated:     ${createdAt.toISOString()}`);
    lines.push("", `View your blueprint: ${viewUrl}`);
    if (downloadUrl)
        lines.push(`Download PDF:  ${downloadUrl}`);
    lines.push("", "The Nexus Team");
    return lines.join("\n");
}
//# sourceMappingURL=blueprintReady.js.map