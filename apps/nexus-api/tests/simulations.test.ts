/**
 * simulations.test.ts
 * Tests for simulations route.
 */

jest.mock("../src/middleware/auth", () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = { id: "user-456", email: "sim@example.com" };
    next();
  },
  generateToken: jest.fn().mockReturnValue("mock-token"),
  verifyToken: jest.fn().mockReturnValue({ userId: "user-456", email: "sim@example.com" }),
}));

jest.mock("../src/database/connection", () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getPool: jest.fn().mockReturnValue(null),
}));

import express from "express";
import request from "supertest";

describe("Simulations route", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.resetModules();
    app = express();
    app.use(express.json());
    const router = require("../src/routes/simulations").default;
    app.use("/api/simulations", router);
  });

  it("creates simulation with recommendation score", async () => {
    const createResponse = await request(app)
      .post("/api/simulations")
      .send({
        title: "Increase menu pricing by 8%",
        baseline: {
          revenue: 120000,
          guests: 3000,
          profit: 24000,
          foodCost: 42000,
          laborCost: 30000,
        },
        changes: [{ type: "Price Changes", magnitudePct: 8 }],
        horizonPeriods: 3,
        periodUnit: "month",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.simulation).toBeDefined();
    expect(typeof createResponse.body.simulation.recommendationScore).toBe("number");
    expect(Array.isArray(createResponse.body.simulation.impacts)).toBe(true);

    const simulationId = createResponse.body.simulation.id;
    const getResponse = await request(app).get(`/api/simulations/${simulationId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.simulation.id).toBe(simulationId);

    const listResponse = await request(app).get("/api/simulations");
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body.simulations)).toBe(true);
    expect(listResponse.body.simulations.length).toBeGreaterThan(0);
  });

  it("returns 404 for missing simulation", async () => {
    const response = await request(app).get("/api/simulations/missing-id");
    expect(response.status).toBe(404);
  });
});
