/**
 * billing.test.ts
 *
 * Unit + Integration + API tests for the Billing route and payment receipt email.
 */

import express from "express";
import request from "supertest";
import billingRouter from "../src/routes/billing";
import {
  paymentReceiptSubject,
  paymentReceiptHtml,
  paymentReceiptText,
  PaymentReceiptData,
} from "../src/templates/paymentReceipt";

// ---------------------------------------------------------------------------
// Mock the email service so no real emails are sent during tests
// ---------------------------------------------------------------------------

jest.mock("../src/services/emailService", () => ({
  sendPaymentReceipt: jest.fn().mockResolvedValue({ id: "mock-email-id-123" }),
}));

import { sendPaymentReceipt } from "../src/services/emailService";

// ---------------------------------------------------------------------------
// Test app setup
// ---------------------------------------------------------------------------

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/billing", billingRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseReceiptData: PaymentReceiptData = {
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  invoiceId: "inv_001",
  planName: "Pro",
  amount: 4999,
  currency: "usd",
  paidAt: new Date("2024-03-15T10:00:00Z"),
};

// ---------------------------------------------------------------------------
// Unit tests — paymentReceipt template
// ---------------------------------------------------------------------------

describe("paymentReceipt template — unit tests", () => {
  it("generates the correct subject line", () => {
    const subject = paymentReceiptSubject(baseReceiptData);
    expect(subject).toBe("Payment Receipt \u2013 Pro (Invoice #inv_001)");
  });

  it("includes the customer name in the HTML output", () => {
    const html = paymentReceiptHtml(baseReceiptData);
    expect(html).toContain("Jane Doe");
  });

  it("includes the invoice ID in the HTML output", () => {
    const html = paymentReceiptHtml(baseReceiptData);
    expect(html).toContain("#inv_001");
  });

  it("formats the amount as currency in the HTML output", () => {
    const html = paymentReceiptHtml(baseReceiptData);
    expect(html).toContain("49.99");
  });

  it("renders a receipt link button when receiptUrl is provided", () => {
    const html = paymentReceiptHtml({
      ...baseReceiptData,
      receiptUrl: "https://receipts.nexus.app/inv_001",
    });
    expect(html).toContain("https://receipts.nexus.app/inv_001");
    expect(html).toContain("View Full Receipt");
  });

  it("omits the receipt link button when receiptUrl is not provided", () => {
    const html = paymentReceiptHtml(baseReceiptData);
    expect(html).not.toContain("View Full Receipt");
  });

  it("includes billing period row when both dates are provided", () => {
    const html = paymentReceiptHtml({
      ...baseReceiptData,
      billingPeriodStart: new Date("2024-03-01"),
      billingPeriodEnd: new Date("2024-03-31"),
    });
    expect(html).toContain("Billing Period");
  });

  it("omits billing period row when dates are not provided", () => {
    const html = paymentReceiptHtml(baseReceiptData);
    expect(html).not.toContain("Billing Period");
  });

  it("generates a plain-text version with correct details", () => {
    const text = paymentReceiptText(baseReceiptData);
    expect(text).toContain("Jane Doe");
    expect(text).toContain("#inv_001");
    expect(text).toContain("Pro");
    expect(text).toContain("The Nexus Team");
  });

  it("includes receipt URL in plain text when provided", () => {
    const text = paymentReceiptText({
      ...baseReceiptData,
      receiptUrl: "https://receipts.nexus.app/inv_001",
    });
    expect(text).toContain("https://receipts.nexus.app/inv_001");
  });
});

// ---------------------------------------------------------------------------
// Integration tests — billing webhook route
// ---------------------------------------------------------------------------

describe("POST /api/billing/webhook — integration tests", () => {
  const app = buildApp();

  it("returns 200 and { received: true } for any event", async () => {
    const res = await request(app)
      .post("/api/billing/webhook")
      .send({ type: "customer.created", data: {} });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
  });

  it("triggers sendPaymentReceipt on payment_intent.succeeded", async () => {
    const mockSend = sendPaymentReceipt as jest.Mock;
    mockSend.mockClear();

    const res = await request(app)
      .post("/api/billing/webhook")
      .send({
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_001",
            amount: 9900,
            currency: "usd",
            created: 1710496800,
            metadata: {
              customerName: "Alice",
              customerEmail: "alice@example.com",
              planName: "Enterprise",
            },
          },
        },
      });

    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: "pi_test_001",
        amount: 9900,
        currency: "usd",
        planName: "Enterprise",
        customerEmail: "alice@example.com",
      })
    );
  });

  it("uses fallback values for missing metadata fields", async () => {
    const mockSend = sendPaymentReceipt as jest.Mock;
    mockSend.mockClear();

    await request(app)
      .post("/api/billing/webhook")
      .send({
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_002",
            amount: 1000,
            currency: "usd",
            created: 1710496800,
            metadata: { customerEmail: "bob@example.com" },
          },
        },
      });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Valued Customer",
        planName: "Nexus Plan",
      })
    );
  });

  it("returns 500 when sendPaymentReceipt throws", async () => {
    const mockSend = sendPaymentReceipt as jest.Mock;
    mockSend.mockRejectedValueOnce(new Error("Resend API unavailable"));

    const res = await request(app)
      .post("/api/billing/webhook")
      .send({
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_test_err",
            amount: 100,
            currency: "usd",
            created: 1710496800,
            metadata: { customerEmail: "err@example.com" },
          },
        },
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Resend API unavailable");
  });
});

// ---------------------------------------------------------------------------
// API tests — manual receipt endpoint
// ---------------------------------------------------------------------------

describe("POST /api/billing/receipt — API tests", () => {
  const app = buildApp();

  it("sends a payment receipt and returns emailId", async () => {
    const mockSend = sendPaymentReceipt as jest.Mock;
    mockSend.mockClear();

    const res = await request(app)
      .post("/api/billing/receipt")
      .send({
        customerName: "Carol",
        customerEmail: "carol@example.com",
        invoiceId: "inv_carol_001",
        planName: "Starter",
        amount: 1999,
        currency: "usd",
        paidAt: "2024-04-01T12:00:00Z",
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, emailId: "mock-email-id-123" });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("parses billingPeriodStart and billingPeriodEnd as Dates", async () => {
    const mockSend = sendPaymentReceipt as jest.Mock;
    mockSend.mockClear();

    await request(app)
      .post("/api/billing/receipt")
      .send({
        customerName: "Dan",
        customerEmail: "dan@example.com",
        invoiceId: "inv_dan_001",
        planName: "Pro",
        amount: 4999,
        currency: "usd",
        paidAt: "2024-04-01T12:00:00Z",
        billingPeriodStart: "2024-04-01T00:00:00Z",
        billingPeriodEnd: "2024-04-30T23:59:59Z",
      });

    const call = (mockSend as jest.Mock).mock.calls[0][0];
    expect(call.billingPeriodStart).toBeInstanceOf(Date);
    expect(call.billingPeriodEnd).toBeInstanceOf(Date);
  });

  it("returns 500 when the email service fails", async () => {
    const mockSend = sendPaymentReceipt as jest.Mock;
    mockSend.mockRejectedValueOnce(new Error("Email send failed"));

    const res = await request(app)
      .post("/api/billing/receipt")
      .send({
        customerName: "Eve",
        customerEmail: "eve@example.com",
        invoiceId: "inv_eve",
        planName: "Pro",
        amount: 4999,
        currency: "usd",
        paidAt: "2024-04-01T12:00:00Z",
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Email send failed");
  });
});
