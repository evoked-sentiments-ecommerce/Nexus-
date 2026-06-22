/**
 * predictions.test.ts
 * Tests for predictions route and forecast accuracy workflow.
 */

jest.mock("../src/middleware/auth", () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = { id: "user-123", email: "test@example.com" };
    next();
  },
  generateToken: jest.fn().mockReturnValue("mock-token"),
  verifyToken: jest.fn().mockReturnValue({ userId: "user-123", email: "test@example.com" }),
}));

jest.mock("../src/database/connection", () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getPool: jest.fn().mockReturnValue(null),
}));

import express from "express";
import request from "supertest";

describe("Predictions route", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.resetModules();
    app = express();
    app.use(express.json());
    const router = require("../src/routes/predictions").default;
    app.use("/api/predictions", router);
  });

  it("creates prediction and records actual outcome", async () => {
    const created = await request(app)
      .post("/api/predictions")
      .send({
        title: "Revenue Forecast",
        scope: "nexus_business",
        target: "Revenue",
        baselineValue: 120000,
        projectedChangePct: 8,
        horizonPeriods: 6,
        periodUnit: "month",
        volatilityPct: 12,
      });

    expect(created.status).toBe(201);
    expect(created.body.prediction).toBeDefined();
    expect(created.body.prediction.id).toBeDefined();
    expect(created.body.prediction.target).toBe("Revenue");

    const predictionId = created.body.prediction.id;

    const compared = await request(app)
      .post(`/api/predictions/${predictionId}/actual`)
      .send({ actualOutcome: 131000 });

    expect(compared.status).toBe(200);
    expect(typeof compared.body.prediction.accuracyScore).toBe("number");
    expect(compared.body.prediction.actualOutcome).toBe(131000);

    const summary = await request(app).get("/api/predictions/accuracy/summary");
    expect(summary.status).toBe(200);
    expect(summary.body.summary).toHaveProperty("Revenue");
  });

  it("returns 400 when title is missing", async () => {
    const response = await request(app).post("/api/predictions").send({});
    expect(response.status).toBe(400);
  });
});
