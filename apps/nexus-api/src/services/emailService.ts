import { Resend } from "resend";

import {
  WelcomeEmailData,
  welcomeEmailSubject,
  welcomeEmailHtml,
  welcomeEmailText,
} from "../templates/welcomeEmail";
import {
  PaymentReceiptData,
  paymentReceiptSubject,
  paymentReceiptHtml,
  paymentReceiptText,
} from "../templates/paymentReceipt";
import {
  BlueprintReadyData,
  blueprintReadySubject,
  blueprintReadyHtml,
  blueprintReadyText,
} from "../templates/blueprintReady";
import {
  PackageReadyData,
  packageReadySubject,
  packageReadyHtml,
  packageReadyText,
} from "../templates/packageReady";

// ---------------------------------------------------------------------------
// Client initialisation
// ---------------------------------------------------------------------------

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }
  return from;
}

// ---------------------------------------------------------------------------
// Email sending helpers
// ---------------------------------------------------------------------------

interface SendResult {
  id: string;
}

/**
 * Send a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<SendResult> {
  const resend = getResendClient();
  const { data: result, error } = await resend.emails.send({
    from: getFromAddress(),
    to: data.email,
    subject: welcomeEmailSubject(),
    html: welcomeEmailHtml(data),
    text: welcomeEmailText(data),
  });

  if (error || !result) {
    throw new Error(`Failed to send welcome email: ${error?.message ?? "unknown error"}`);
  }

  return { id: result.id };
}

/**
 * Send a payment receipt after a successful billing charge.
 */
export async function sendPaymentReceipt(data: PaymentReceiptData): Promise<SendResult> {
  const resend = getResendClient();
  const { data: result, error } = await resend.emails.send({
    from: getFromAddress(),
    to: data.customerEmail,
    subject: paymentReceiptSubject(data),
    html: paymentReceiptHtml(data),
    text: paymentReceiptText(data),
  });

  if (error || !result) {
    throw new Error(`Failed to send payment receipt: ${error?.message ?? "unknown error"}`);
  }

  return { id: result.id };
}

/**
 * Notify a user that their Chef Drew hospitality blueprint is ready.
 */
export async function sendBlueprintReadyNotification(
  to: string,
  data: BlueprintReadyData
): Promise<SendResult> {
  const resend = getResendClient();
  const { data: result, error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: blueprintReadySubject(data),
    html: blueprintReadyHtml(data),
    text: blueprintReadyText(data),
  });

  if (error || !result) {
    throw new Error(`Failed to send blueprint ready notification: ${error?.message ?? "unknown error"}`);
  }

  return { id: result.id };
}

/**
 * Notify a user that their asset package is ready to download.
 */
export async function sendPackageDownloadNotification(
  to: string,
  data: PackageReadyData
): Promise<SendResult> {
  const resend = getResendClient();
  const { data: result, error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: packageReadySubject(data),
    html: packageReadyHtml(data),
    text: packageReadyText(data),
  });

  if (error || !result) {
    throw new Error(`Failed to send package download notification: ${error?.message ?? "unknown error"}`);
  }

  return { id: result.id };
}

// ---------------------------------------------------------------------------
// Re-export data types for convenience
// ---------------------------------------------------------------------------

export type {
  WelcomeEmailData,
  PaymentReceiptData,
  BlueprintReadyData,
  PackageReadyData,
};
