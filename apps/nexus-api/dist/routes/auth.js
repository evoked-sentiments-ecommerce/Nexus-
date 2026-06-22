"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express_1 = require("express");
const repositories_1 = require("../database/repositories");
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userRepository = new repositories_1.UserRepository();
const memoryUsers = new Map();
function getBcrypt() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require("bcryptjs");
    }
    catch {
        return null;
    }
}
async function hashPassword(password) {
    const bcrypt = getBcrypt();
    if (!bcrypt)
        return `plain:${password}`;
    return bcrypt.hash(password, 10);
}
async function verifyPassword(password, passwordHash) {
    const bcrypt = getBcrypt();
    if (!bcrypt)
        return passwordHash === `plain:${password}` || passwordHash === password;
    return bcrypt.compare(password, passwordHash);
}
function sanitizeUser(user) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
}
router.post("/register", async (req, res) => {
    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";
        const name = typeof req.body.name === "string" ? req.body.name.trim() : null;
        if (!email || !password) {
            res.status(400).json({ error: "email and password are required" });
            return;
        }
        const existingUser = env_1.env.DATABASE_URL
            ? await userRepository.findByEmail(email)
            : Array.from(memoryUsers.values()).find((user) => user.email === email) ?? null;
        if (existingUser) {
            res.status(409).json({ error: "User already exists" });
            return;
        }
        const userRecord = {
            id: (0, crypto_1.randomUUID)(),
            email,
            passwordHash: await hashPassword(password),
            name,
            role: "user",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const persisted = env_1.env.DATABASE_URL
            ? await userRepository.create(userRecord)
            : null;
        const user = persisted ?? userRecord;
        if (!persisted && !env_1.env.DATABASE_URL) {
            memoryUsers.set(user.id, userRecord);
        }
        const token = (0, auth_1.generateToken)(user.id, user.email);
        res.status(201).json({ user: sanitizeUser(user), token });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";
        if (!email || !password) {
            res.status(400).json({ error: "email and password are required" });
            return;
        }
        const user = env_1.env.DATABASE_URL
            ? await userRepository.findByEmail(email)
            : Array.from(memoryUsers.values()).find((entry) => entry.email === email) ?? null;
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, auth_1.generateToken)(user.id, user.email);
        res.json({ user: sanitizeUser(user), token });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
router.get("/me", (req, res, next) => (0, auth_1.authenticateToken)(req, res, next), async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const user = env_1.env.DATABASE_URL
            ? await userRepository.findByEmail(authReq.user.email)
            : Array.from(memoryUsers.values()).find((entry) => entry.email === authReq.user?.email) ?? null;
        if (!user) {
            res.json({ user: authReq.user });
            return;
        }
        res.json({ user: sanitizeUser(user) });
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map