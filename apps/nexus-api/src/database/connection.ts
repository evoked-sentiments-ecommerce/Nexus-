import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    const connectionString = getRequiredEnv("DATABASE_URL");
    pool = new Pool({
      connectionString,
      max: Number.parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10),
      idleTimeoutMillis: Number.parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS ?? "30000", 10),
      connectionTimeoutMillis: Number.parseInt(
        process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? "5000",
        10,
      ),
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
};

export type QueryExecutor = Pick<Pool, "query"> | Pick<PoolClient, "query">;

export const query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<T>> => getPool().query<T>(text, values);

export const withTransaction = async <T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const closePool = async (): Promise<void> => {
  if (!pool) return;
  const activePool = pool;
  pool = null;
  await activePool.end();
};
