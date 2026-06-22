import { Resend } from "resend";
import {
  buildWelcomeEmail,
  type WelcomeEmailInput,
} from "../templates/welcomeEmail";
import {
  buildPaymentReceiptEmail,
  type PaymentReceiptInput,
} from "../templates/paymentReceipt";
import {
  buildBlueprintReadyEmail,
  type BlueprintReadyInput,
} from "../templates/blueprintReady";
import {
  buildPackageReadyEmail,
  type PackageReadyInput,
} from "../templates/packageReady";

export type { WelcomeEmailInput, PaymentReceiptInput, BlueprintReadyInput, PackageReadyInput };

export type SendEmailResult = {
  id: string;
  to: string;
  subject: string;
};

const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: RESEND_API_KEY");
  }

  return new Resend(apiKey);
};

const getEmailFrom = (): string => {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Missing required environment variable: EMAIL_FROM");
  }

  return from;
};

const sendEmail = async (params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> => {
  const client = getResendClient();
  const from = getEmailFrom();

  const { data, error } = await client.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to send email");
  }

  return {
    id: data.id,
    to: params.to,
    subject: params.subject,
  };
};

export const sendWelcomeEmail = async (
  input: WelcomeEmailInput,
): Promise<SendEmailResult> => {
  const template = buildWelcomeEmail(input);
  return sendEmail({
    to: input.recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

export const sendPaymentReceiptEmail = async (
  input: PaymentReceiptInput,
): Promise<SendEmailResult> => {
  const template = buildPaymentReceiptEmail(input);
  return sendEmail({
    to: input.recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

export const sendBlueprintReadyEmail = async (
  input: BlueprintReadyInput,
): Promise<SendEmailResult> => {
  const template = buildBlueprintReadyEmail(input);
  return sendEmail({
    to: input.recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

export const sendPackageReadyEmail = async (
  input: PackageReadyInput,
): Promise<SendEmailResult> => {
  const template = buildPackageReadyEmail(input);
  return sendEmail({
    to: input.recipientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};
