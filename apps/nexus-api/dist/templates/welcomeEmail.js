"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeEmailSubject = welcomeEmailSubject;
exports.welcomeEmailHtml = welcomeEmailHtml;
exports.welcomeEmailText = welcomeEmailText;
function welcomeEmailSubject() {
    return "Welcome to Nexus – Let's Get Started";
}
function welcomeEmailHtml(data) {
    const { name, loginUrl = "https://nexus.app/login" } = data;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Nexus</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 48px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px; }
    .body { padding: 40px 48px; }
    .body p { margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6; }
    .cta { display: inline-block; margin: 24px 0; padding: 14px 32px; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .footer { padding: 24px 48px; border-top: 1px solid #e5e7eb; text-align: center; }
    .footer p { margin: 0; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Welcome to Nexus</h1>
      <p>Your hospitality operations platform</p>
    </div>
    <div class="body">
      <p>Hi ${name},</p>
      <p>We're thrilled to have you on board. Nexus gives you everything you need to manage hospitality operations, generate blueprints, and deliver exceptional guest experiences.</p>
      <p>Here's what you can do right away:</p>
      <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
        <li>Create and manage hospitality blueprints with Chef Drew</li>
        <li>Generate and download asset packages</li>
        <li>Track projects and research</li>
        <li>Manage your brand identity</li>
      </ul>
      <a href="${loginUrl}" class="cta">Get Started</a>
      <p>If you have any questions, just reply to this email — we're always happy to help.</p>
      <p>Welcome aboard,<br /><strong>The Nexus Team</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Nexus. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
function welcomeEmailText(data) {
    const { name, loginUrl = "https://nexus.app/login" } = data;
    return `Hi ${name},

Welcome to Nexus! We're thrilled to have you on board.

Nexus gives you everything you need to manage hospitality operations, generate blueprints, and deliver exceptional guest experiences.

Get started here: ${loginUrl}

Welcome aboard,
The Nexus Team`;
}
//# sourceMappingURL=welcomeEmail.js.map