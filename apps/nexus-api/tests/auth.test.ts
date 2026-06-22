/**
 * auth.test.ts
 * Tests for auth middleware and routes.
 */

jest.mock(
  "jsonwebtoken",
  () => ({
    sign: jest.fn().mockReturnValue("mock-jwt-token"),
    verify: jest.fn().mockReturnValue({ userId: "user-123", email: "test@example.com" }),
  }),
  { virtual: true }
);

jest.mock(
  "bcryptjs",
  () => ({
    hash: jest.fn().mockResolvedValue("hashed-password"),
    compare: jest.fn().mockResolvedValue(true),
  }),
  { virtual: true }
);

jest.mock("../src/database/connection", () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  getPool: jest.fn().mockReturnValue(null),
}));

jest.mock("../src/database/repositories", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed-password",
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  })),
}));

import express from "express";
import request from "supertest";
import { authenticateToken, generateToken, verifyToken } from "../src/middleware/auth";

describe("generateToken", () => {
  it("should return a token string", () => {
    const token = generateToken("user-123", "test@example.com");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should generate string tokens for different users", () => {
    const token1 = generateToken("user-1", "user1@example.com");
    const token2 = generateToken("user-2", "user2@example.com");
    expect(typeof token1).toBe("string");
    expect(typeof token2).toBe("string");
  });
});

describe("verifyToken", () => {
  it("should return a payload for a valid token", () => {
    const payload = verifyToken("mock-jwt-token");
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({ userId: "user-123", email: "test@example.com" });
  });

  it("should return null when jwt.verify throws", () => {
    const jwt = require("jsonwebtoken");
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("invalid token");
    });
    expect(verifyToken("invalid-token")).toBeNull();
  });
});

describe("authenticateToken middleware", () => {
  const app = express();
  app.use(express.json());
  app.get("/protected", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  it("should return 401 if no Authorization header", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
  });

  it("should return 401 if token format is wrong", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Basic abc123");
    expect(res.status).toBe(401);
  });

  it("should attach user if token is valid", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer mock-jwt-token");
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "user-123", email: "test@example.com" });
  });

  it("should return 401 if token verification fails", async () => {
    const jwt = require("jsonwebtoken");
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("expired");
    });
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer mock-jwt-token");
    expect(res.status).toBe(401);
  });
});

describe("Auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have auth routes module loadable", () => {
    expect(() => require("../src/routes/auth")).not.toThrow();
  });
});
