"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageReadySubject = packageReadySubject;
exports.packageReadyHtml = packageReadyHtml;
exports.packageReadyText = packageReadyText;
function packageReadySubject(data) {
    return `Your Package is Ready to Download – ${data.packageName}`;
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
function packageReadyHtml(data) {
    const { customerName, packageName, packageId, packageType, assetCount, fileSize, generatedAt, downloadUrl, expiresAt, } = data;
    const fileSizeRow = fileSize
        ? `<tr>
        <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #d1fae5;">File Size</td>
        <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #d1fae5;">${fileSize}</td>
      </tr>`
        : "";
    const expiryNotice = expiresAt
        ? `<div style="margin-top:20px;padding:12px 16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;">
        <p style="margin:0;color:#92400e;font-size:13px;">⚠️ This download link expires on <strong>${formatDate(expiresAt)}</strong>. Please download your package before then.</p>
      </div>`
        : "";
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Package Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 48px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📦</div>
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Package Ready</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Your asset package has been generated</p>
    </div>
    <div style="padding:40px 48px;">
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        Hi ${customerName}, your package <strong>${packageName}</strong> is ready! Click the button below to start your download.
      </p>

      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #d1fae5;">Package ID</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #d1fae5;font-family:monospace;">${packageId}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #d1fae5;">Package Type</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #d1fae5;">${packageType}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;border-bottom:1px solid #d1fae5;">Assets Included</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;border-bottom:1px solid #d1fae5;">${assetCount} file${assetCount !== 1 ? "s" : ""}</td>
          </tr>
          ${fileSizeRow}
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;">Generated</td>
            <td style="padding:10px 0;color:#111827;font-size:14px;text-align:right;">${formatDate(generatedAt)}</td>
          </tr>
        </table>
      </div>

      <a href="${downloadUrl}" style="display:inline-block;padding:14px 32px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">Download Package</a>

      ${expiryNotice}

      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${downloadUrl}" style="color:#6366f1;word-break:break-all;">${downloadUrl}</a>
      </p>
    </div>
    <div style="padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:13px;">© ${new Date().getFullYear()} Nexus. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
function packageReadyText(data) {
    const { customerName, packageName, packageId, packageType, assetCount, fileSize, generatedAt, downloadUrl, expiresAt, } = data;
    const lines = [
        `Hi ${customerName},`,
        "",
        `Your package "${packageName}" is ready to download!`,
        "",
        `Package ID:  ${packageId}`,
        `Type:        ${packageType}`,
        `Assets:      ${assetCount} file${assetCount !== 1 ? "s" : ""}`,
    ];
    if (fileSize)
        lines.push(`Size:        ${fileSize}`);
    lines.push(`Generated:   ${generatedAt.toISOString()}`);
    if (expiresAt)
        lines.push(`Expires:     ${expiresAt.toISOString()}`);
    lines.push("", `Download: ${downloadUrl}`);
    lines.push("", "The Nexus Team");
    return lines.join("\n");
}
//# sourceMappingURL=packageReady.js.map