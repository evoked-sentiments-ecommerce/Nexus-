import { randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { UserRepository, UserRecord } from "../database/repositories";
import { env } from "../config/env";
import { authenticateToken, AuthenticatedRequest, generateToken } from "../middleware/auth";

const router = Router();
const userRepository = new UserRepository();
const memoryUsers = new Map<string, UserRecord>();

function getBcrypt():
  | {
      hash(value: string, rounds: number): Promise<string>;
      compare(value: string, hash: string): Promise<boolean>;
    }
  | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("bcryptjs") as {
      hash(value: string, rounds: number): Promise<string>;
      compare(value: string, hash: string): Promise<boolean>;
    };
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const bcrypt = getBcrypt();
  if (!bcrypt) return `plain:${password}`;
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const bcrypt = getBcrypt();
  if (!bcrypt) return passwordHash === `plain:${password}` || passwordHash === password;
  return bcrypt.compare(password, passwordHash);
}

function sanitizeUser(user: UserRecord): Omit<UserRecord, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const name = typeof req.body.name === "string" ? req.body.name.trim() : null;

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const existingUser = env.DATABASE_URL
      ? await userRepository.findByEmail(email)
      : Array.from(memoryUsers.values()).find((user) => user.email === email) ?? null;

    if (existingUser) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    const userRecord: UserRecord = {
      id: randomUUID(),
      email,
      passwordHash: await hashPassword(password),
      name,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const persisted = env.DATABASE_URL
      ? await userRepository.create(userRecord)
      : null;

    const user = persisted ?? userRecord;
    if (!persisted && !env.DATABASE_URL) {
      memoryUsers.set(user.id, userRecord);
    }

    const token = generateToken(user.id, user.email);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = env.DATABASE_URL
      ? await userRepository.findByEmail(email)
      : Array.from(memoryUsers.values()).find((entry) => entry.email === email) ?? null;

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.email);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get(
  "/me",
  (req, res, next) => authenticateToken(req as AuthenticatedRequest, res, next),
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const user = env.DATABASE_URL
        ? await userRepository.findByEmail(authReq.user.email)
        : Array.from(memoryUsers.values()).find((entry) => entry.email === authReq.user?.email) ?? null;

      if (!user) {
        res.json({ user: authReq.user });
        return;
      }

      res.json({ user: sanitizeUser(user) });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
);

export default router;
