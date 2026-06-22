"use strict";
// ---------------------------------------------------------------------------
// Database Connection — PostgreSQL pool and query helper
// ---------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getPool = getPool;
exports.runMigrations = runMigrations;
const logger_1 = require("../services/logger");
// ---------------------------------------------------------------------------
// Pool (lazy-initialized)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPool() {
    if (pool)
        return pool;
    const url = process.env.DATABASE_URL;
    if (!url) {
        (0, logger_1.logError)("database_pool_error", { message: "DATABASE_URL not set — DB operations disabled" });
        return null;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Pool } = require("pg");
        pool = new Pool({ connectionString: url });
        pool.on("error", (err) => {
            (0, logger_1.logError)("database_pool_error", { message: err.message });
        });
        (0, logger_1.logInfo)("database_pool_created", { url: url.replace(/:[^:@]*@/, ":***@") });
        return pool;
    }
    catch (err) {
        (0, logger_1.logError)("database_pool_error", { message: err instanceof Error ? err.message : String(err) });
        return null;
    }
}
// ---------------------------------------------------------------------------
// Query helper
// ---------------------------------------------------------------------------
async function query(text, params) {
    const p = getPool();
    if (!p) {
        (0, logger_1.logError)("database_query_skipped", { reason: "No database pool available" });
        return { rows: [], rowCount: 0 };
    }
    const result = await p.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount };
}
// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------
async function runMigrations() {
    const p = getPool();
    if (!p) {
        (0, logger_1.logError)("migrations_skipped", { reason: "No database pool available" });
        return;
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require("fs");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require("path");
        const migrationsDir = path.join(__dirname, "migrations");
        const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
            await p.query(sql);
            (0, logger_1.logInfo)("migration_applied", { file });
        }
    }
    catch (err) {
        (0, logger_1.logError)("migrations_error", { message: err instanceof Error ? err.message : String(err) });
    }
}
//# sourceMappingURL=connection.js.map