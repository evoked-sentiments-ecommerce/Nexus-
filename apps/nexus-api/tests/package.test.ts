/**
 * package.test.ts
 *
 * Unit + Integration + API tests for the Package route and packageReady email template.
 */

import express from "express";
import request from "supertest";
import packagesRouter from "../src/routes/packages";
import {
  packageReadySubject,
  packageReadyHtml,
  packageReadyText,
  PackageReadyData,
} from "../src/templates/packageReady";

// ---------------------------------------------------------------------------
// Mock the email service so no real emails are sent during tests
// ---------------------------------------------------------------------------

jest.mock("../src/services/emailService", () => ({
  sendPackageDownloadNotification: jest
    .fn()
    .mockResolvedValue({ id: "mock-email-pkg-001" }),
}));

import { sendPackageDownloadNotification } from "../src/services/emailService";

// ---------------------------------------------------------------------------
// Test app setup
// ---------------------------------------------------------------------------

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/packages", packagesRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const basePackageData: PackageReadyData = {
  customerName: "John Smith",
  packageName: "Summer Menu Package",
  packageId: "pkg-2024-001",
  packageType: "Menu Kit",
  assetCount: 12,
  generatedAt: new Date("2024-05-01T09:00:00Z"),
  downloadUrl: "https://cdn.nexus.app/packages/pkg-2024-001.zip",
};

// ---------------------------------------------------------------------------
// Unit tests — packageReady template
// ---------------------------------------------------------------------------

describe("packageReady template — unit tests", () => {
  it("generates the correct subject line", () => {
    const subject = packageReadySubject(basePackageData);
    expect(subject).toBe(
      "Your Package is Ready to Download \u2013 Summer Menu Package"
    );
  });

  it("includes the customer name in the HTML output", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).toContain("John Smith");
  });

  it("includes the package name in the HTML output", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).toContain("Summer Menu Package");
  });

  it("includes the package ID in the HTML output", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).toContain("pkg-2024-001");
  });

  it("includes the download URL in the HTML output", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).toContain("https://cdn.nexus.app/packages/pkg-2024-001.zip");
  });

  it("includes the asset count in the HTML output", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).toContain("12 files");
  });

  it("uses singular 'file' when assetCount is 1", () => {
    const html = packageReadyHtml({ ...basePackageData, assetCount: 1 });
    expect(html).toContain("1 file");
    expect(html).not.toContain("1 files");
  });

  it("includes file size when provided", () => {
    const html = packageReadyHtml({ ...basePackageData, fileSize: "4.2 MB" });
    expect(html).toContain("4.2 MB");
  });

  it("omits file size row when not provided", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).not.toContain("File Size");
  });

  it("renders an expiry warning when expiresAt is provided", () => {
    const html = packageReadyHtml({
      ...basePackageData,
      expiresAt: new Date("2024-05-08T09:00:00Z"),
    });
    expect(html).toContain("expires on");
  });

  it("omits the expiry warning when expiresAt is not provided", () => {
    const html = packageReadyHtml(basePackageData);
    expect(html).not.toContain("expires on");
  });

  it("generates plain text with correct details", () => {
    const text = packageReadyText(basePackageData);
    expect(text).toContain("John Smith");
    expect(text).toContain("Summer Menu Package");
    expect(text).toContain("pkg-2024-001");
    expect(text).toContain("https://cdn.nexus.app/packages/pkg-2024-001.zip");
    expect(text).toContain("The Nexus Team");
  });

  it("includes expiry in plain text when expiresAt is provided", () => {
    const text = packageReadyText({
      ...basePackageData,
      expiresAt: new Date("2024-05-08T09:00:00Z"),
    });
    expect(text).toContain("Expires:");
  });

  it("includes file size in plain text when provided", () => {
    const text = packageReadyText({ ...basePackageData, fileSize: "4.2 MB" });
    expect(text).toContain("4.2 MB");
  });
});

// ---------------------------------------------------------------------------
// Integration + API tests — packages/:id/ready route
// ---------------------------------------------------------------------------

describe("POST /api/packages/:id/ready — integration + API tests", () => {
  const app = buildApp();

  const validPayload = {
    customerEmail: "john@example.com",
    customerName: "John Smith",
    packageName: "Summer Menu Package",
    packageType: "Menu Kit",
    assetCount: 12,
    fileSize: "4.2 MB",
    downloadUrl: "https://cdn.nexus.app/packages/pkg-2024-001.zip",
  };

  it("returns 200 and { success: true } when notification is sent", async () => {
    const res = await request(app)
      .post("/api/packages/pkg-2024-001/ready")
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it("calls sendPackageDownloadNotification with the correct package ID", async () => {
    const mockSend = sendPackageDownloadNotification as jest.Mock;
    mockSend.mockClear();

    await request(app)
      .post("/api/packages/pkg-unique-id/ready")
      .send(validPayload);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [toArg, dataArg] = mockSend.mock.calls[0];
    expect(toArg).toBe("john@example.com");
    expect(dataArg.packageId).toBe("pkg-unique-id");
    expect(dataArg.packageName).toBe("Summer Menu Package");
  });

  it("passes expiresAt as a Date when provided", async () => {
    const mockSend = sendPackageDownloadNotification as jest.Mock;
    mockSend.mockClear();

    await request(app)
      .post("/api/packages/pkg-exp/ready")
      .send({ ...validPayload, expiresAt: "2024-05-08T09:00:00Z" });

    const dataArg = (mockSend as jest.Mock).mock.calls[0][1];
    expect(dataArg.expiresAt).toBeInstanceOf(Date);
  });

  it("passes undefined for expiresAt when not provided", async () => {
    const mockSend = sendPackageDownloadNotification as jest.Mock;
    mockSend.mockClear();

    await request(app)
      .post("/api/packages/pkg-no-exp/ready")
      .send(validPayload);

    const dataArg = (mockSend as jest.Mock).mock.calls[0][1];
    expect(dataArg.expiresAt).toBeUndefined();
  });

  it("sets generatedAt to approximately now", async () => {
    const mockSend = sendPackageDownloadNotification as jest.Mock;
    mockSend.mockClear();

    const before = Date.now();
    await request(app)
      .post("/api/packages/pkg-time/ready")
      .send(validPayload);
    const after = Date.now();

    const dataArg = (mockSend as jest.Mock).mock.calls[0][1];
    expect(dataArg.generatedAt).toBeInstanceOf(Date);
    expect(dataArg.generatedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(dataArg.generatedAt.getTime()).toBeLessThanOrEqual(after + 5);
  });

  it("returns 500 when sendPackageDownloadNotification throws", async () => {
    const mockSend = sendPackageDownloadNotification as jest.Mock;
    mockSend.mockRejectedValueOnce(new Error("Storage unavailable"));

    const res = await request(app)
      .post("/api/packages/pkg-err/ready")
      .send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Storage unavailable");
  });

  it("uses package ID from the URL parameter", async () => {
    const mockSend = sendPackageDownloadNotification as jest.Mock;
    mockSend.mockClear();

    const customId = "custom-pkg-abc-123";
    await request(app)
      .post(`/api/packages/${customId}/ready`)
      .send(validPayload);

    const dataArg = (mockSend as jest.Mock).mock.calls[0][1];
    expect(dataArg.packageId).toBe(customId);
  });
});
