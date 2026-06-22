"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPaymentReceipt = sendPaymentReceipt;
exports.sendBlueprintReadyNotification = sendBlueprintReadyNotification;
exports.sendPackageDownloadNotification = sendPackageDownloadNotification;
const resend_1 = require("resend");
const welcomeEmail_1 = require("../templates/welcomeEmail");
const paymentReceipt_1 = require("../templates/paymentReceipt");
const blueprintReady_1 = require("../templates/blueprintReady");
const packageReady_1 = require("../templates/packageReady");
// ---------------------------------------------------------------------------
// Client initialisation
// ---------------------------------------------------------------------------
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY environment variable is not set");
    }
    return new resend_1.Resend(apiKey);
}
function getFromAddress() {
    const from = process.env.EMAIL_FROM;
    if (!from) {
        throw new Error("EMAIL_FROM environment variable is not set");
    }
    return from;
}
/**
 * Send a welcome email to a newly registered user.
 */
async function sendWelcomeEmail(data) {
    const resend = getResendClient();
    const { data: result, error } = await resend.emails.send({
        from: getFromAddress(),
        to: data.email,
        subject: (0, welcomeEmail_1.welcomeEmailSubject)(),
        html: (0, welcomeEmail_1.welcomeEmailHtml)(data),
        text: (0, welcomeEmail_1.welcomeEmailText)(data),
    });
    if (error || !result) {
        throw new Error(`Failed to send welcome email: ${error?.message ?? "unknown error"}`);
    }
    return { id: result.id };
}
/**
 * Send a payment receipt after a successful billing charge.
 */
async function sendPaymentReceipt(data) {
    const resend = getResendClient();
    const { data: result, error } = await resend.emails.send({
        from: getFromAddress(),
        to: data.customerEmail,
        subject: (0, paymentReceipt_1.paymentReceiptSubject)(data),
        html: (0, paymentReceipt_1.paymentReceiptHtml)(data),
        text: (0, paymentReceipt_1.paymentReceiptText)(data),
    });
    if (error || !result) {
        throw new Error(`Failed to send payment receipt: ${error?.message ?? "unknown error"}`);
    }
    return { id: result.id };
}
/**
 * Notify a user that their Chef Drew hospitality blueprint is ready.
 */
async function sendBlueprintReadyNotification(to, data) {
    const resend = getResendClient();
    const { data: result, error } = await resend.emails.send({
        from: getFromAddress(),
        to,
        subject: (0, blueprintReady_1.blueprintReadySubject)(data),
        html: (0, blueprintReady_1.blueprintReadyHtml)(data),
        text: (0, blueprintReady_1.blueprintReadyText)(data),
    });
    if (error || !result) {
        throw new Error(`Failed to send blueprint ready notification: ${error?.message ?? "unknown error"}`);
    }
    return { id: result.id };
}
/**
 * Notify a user that their asset package is ready to download.
 */
async function sendPackageDownloadNotification(to, data) {
    const resend = getResendClient();
    const { data: result, error } = await resend.emails.send({
        from: getFromAddress(),
        to,
        subject: (0, packageReady_1.packageReadySubject)(data),
        html: (0, packageReady_1.packageReadyHtml)(data),
        text: (0, packageReady_1.packageReadyText)(data),
    });
    if (error || !result) {
        throw new Error(`Failed to send package download notification: ${error?.message ?? "unknown error"}`);
    }
    return { id: result.id };
}
//# sourceMappingURL=emailService.js.map