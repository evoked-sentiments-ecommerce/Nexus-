"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const connection_1 = require("./database/connection");
const auth_1 = __importDefault(require("./routes/auth"));
const billing_1 = __importDefault(require("./routes/billing"));
const brands_1 = __importDefault(require("./routes/brands"));
const chef_drew_1 = __importDefault(require("./routes/chef-drew"));
const documents_1 = __importDefault(require("./routes/documents"));
const evolution_1 = __importDefault(require("./routes/evolution"));
const objectives_1 = __importDefault(require("./routes/objectives"));
const packages_1 = __importDefault(require("./routes/packages"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const projects_1 = __importDefault(require("./routes/projects"));
const research_1 = __importDefault(require("./routes/research"));
const storage_1 = __importDefault(require("./routes/storage"));
const logger_1 = require("./services/logger");
const app = (0, express_1.default)();
function buildCorsMiddleware() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const cors = require("cors");
        return cors({ origin: true, credentials: true });
    }
    catch {
        (0, logger_1.logWarn)("cors_unavailable", { reason: "cors package not installed" });
        return (_req, _res, next) => next();
    }
}
app.use(buildCorsMiddleware());
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
        (0, logger_1.logRequest)({
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            ip: req.ip,
            userAgent: req.get("user-agent") ?? undefined,
        });
    });
    next();
});
app.get("/health", (_req, res) => {
    res.json({ ok: true, environment: env_1.env.NODE_ENV });
});
app.use("/api/auth", auth_1.default);
app.use("/api/billing", billing_1.default);
app.use("/api/brands", brands_1.default);
app.use("/api/chef-drew", chef_drew_1.default);
app.use("/api/documents", documents_1.default);
app.use("/api/evolution", evolution_1.default);
app.use("/api/objectives", objectives_1.default);
app.use("/api/packages", packages_1.default);
app.use("/api/pdf", pdf_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/research", research_1.default);
app.use("/api/storage", storage_1.default);
app.use((err, _req, res, _next) => {
    (0, logger_1.logError)("api_unhandled_error", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
    });
    res.status(500).json({ error: "Internal server error" });
});
async function startServer() {
    await (0, connection_1.runMigrations)();
    app.listen(env_1.env.PORT, () => {
        (0, logger_1.logInfo)("api_server_started", { port: env_1.env.PORT, environment: env_1.env.NODE_ENV });
    });
}
if (require.main === module) {
    void startServer().catch((err) => {
        (0, logger_1.logError)("api_server_start_failed", {
            message: err instanceof Error ? err.message : String(err),
        });
        process.exitCode = 1;
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map