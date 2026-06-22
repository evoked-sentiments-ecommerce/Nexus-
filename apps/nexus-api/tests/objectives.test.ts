/**
 * objectives.test.ts
 * Tests for objectives route and planner service.
 */

jest.mock("../src/database/connection", () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getPool: jest.fn().mockReturnValue(null),
}));

jest.mock("../src/database/repositories", () => ({
  ObjectiveRepository: jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(async (objective: unknown) => objective),
    update: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(false),
  })),
}));

jest.mock("../src/middleware/auth", () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = { id: "user-123", email: "test@example.com" };
    next();
  },
  generateToken: jest.fn().mockReturnValue("mock-token"),
  verifyToken: jest.fn().mockReturnValue({ userId: "user-123", email: "test@example.com" }),
}));

import express from "express";
import request from "supertest";

describe("Objectives route", () => {
  let app: express.Application;

  beforeEach(() => {
    jest.resetModules();
    app = express();
    app.use(express.json());
    const router = require("../src/routes/objectives").default;
    app.use("/api/objectives", router);
  });

  describe("GET /api/objectives", () => {
    it("should return 200 with empty array when no objectives", async () => {
      const res = await request(app).get("/api/objectives");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ objectives: [] });
    });
  });

  describe("POST /api/objectives", () => {
    it("should create an objective and return 201", async () => {
      const res = await request(app)
        .post("/api/objectives")
        .send({
          projectId: "project-123",
          title: "Test Objective",
          description: "A test objective",
          priority: "medium",
        });

      expect(res.status).toBe(201);
      expect(res.body.objective).toMatchObject({
        projectId: "project-123",
        title: "Test Objective",
        priority: "medium",
        status: "pending",
      });
    });

    it("should return 400 for empty request", async () => {
      const res = await request(app).post("/api/objectives").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/objectives/:id", () => {
    it("should return 404 when objective not found", async () => {
      const res = await request(app).get("/api/objectives/nonexistent-id");
      expect(res.status).toBe(404);
    });
  });
});

describe("Planner service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should import buildPlan without throwing", () => {
    expect(() => require("../src/services/planner")).not.toThrow();
  });

  it("should call buildPlan and return a plan structure", async () => {
    const { buildPlan } = require("../src/services/planner");
    const plan = await buildPlan({
      id: "goal-1",
      title: "Test Goal",
      description: "Description",
      priority: "medium",
    });

    expect(plan).toBeDefined();
    expect(plan.planId).toBeDefined();
    expect(plan.goalId).toBe("goal-1");
    expect(Array.isArray(plan.objectives)).toBe(true);
    expect(Array.isArray(plan.tasks)).toBe(true);
  });
});
