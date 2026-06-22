// ---------------------------------------------------------------------------
// Auth Middleware — JWT authentication for Express routes
// ---------------------------------------------------------------------------

import { Request, Response, NextFunction } from "express";
import { logWarn } from "../services/logger";

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require("jsonwebtoken");
    return jwt.sign({ userId, email }, secret, { expiresIn });
  } catch {
    logWarn("jwt_sign_failed", { reason: "jsonwebtoken not available" });
    return `stub-token-${userId}`;
  }
}

export function verifyToken(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = { id: payload.userId, email: payload.email };
  next();
}
