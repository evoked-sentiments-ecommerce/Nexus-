"use strict";
// ---------------------------------------------------------------------------
// Auth Middleware — JWT authentication for Express routes
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticateToken = authenticateToken;
const logger_1 = require("../services/logger");
function generateToken(userId, email) {
    const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
    const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const jwt = require("jsonwebtoken");
        return jwt.sign({ userId, email }, secret, { expiresIn });
    }
    catch {
        (0, logger_1.logWarn)("jwt_sign_failed", { reason: "jsonwebtoken not available" });
        return `stub-token-${userId}`;
    }
}
function verifyToken(token) {
    const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const jwt = require("jsonwebtoken");
        return jwt.verify(token, secret);
    }
    catch {
        return null;
    }
}
function authenticateToken(req, res, next) {
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
//# sourceMappingURL=auth.js.map