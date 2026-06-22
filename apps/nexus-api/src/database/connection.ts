// ---------------------------------------------------------------------------
// Database Connection — PostgreSQL pool and query helper
// ---------------------------------------------------------------------------

import { logError, logInfo } from "../services/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number | null;
}

// ---------------------------------------------------------------------------
// Pool (lazy-initialized)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPool(): any {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    logError("database_pool_error", { message: "DATABASE_URL not set — DB operations disabled" });
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    pool = new Pool({ connectionString: url });
    pool.on("error", (err: Error) => {
      logError("database_pool_error", { message: err.message });
    });
    logInfo("database_pool_created", { url: url.replace(/:[^:@]*@/, ":***@") });
    return pool;
  } catch (err) {
    logError("database_pool_error", { message: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Query helper
// ---------------------------------------------------------------------------

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const p = getPool();
  if (!p) {
    logError("database_query_skipped", { reason: "No database pool available" });
    return { rows: [], rowCount: 0 };
  }
  const result = await p.query(text, params);
  return { rows: result.rows as T[], rowCount: result.rowCount };
}

export { getPool };

// ---------------------------------------------------------------------------
// Migrations
// ---------------------------------------------------------------------------

export async function runMigrations(): Promise<void> {
  const p = getPool();
  if (!p) {
    logError("migrations_skipped", { reason: "No database pool available" });
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir).filter((f: string) => f.endsWith(".sql")).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await p.query(sql);
      logInfo("migration_applied", { file });
    }
  } catch (err) {
    logError("migrations_error", { message: err instanceof Error ? err.message : String(err) });
  }
}
