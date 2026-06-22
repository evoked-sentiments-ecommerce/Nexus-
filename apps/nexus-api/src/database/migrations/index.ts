import { readFileSync } from "node:fs";
import { join } from "node:path";
import { query, withTransaction } from "../connection";

const migrationFile = join(__dirname, "001_initial.sql");

export const runMigrations = async (): Promise<void> => {
  const sql = readFileSync(migrationFile, "utf8");

  await query(
    `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
  );

  const version = "001_initial";
  const existing = await query<{ version: string }>(
    "SELECT version FROM schema_migrations WHERE version = $1",
    [version],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return;
  }

  await withTransaction(async (client) => {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
  });
};
