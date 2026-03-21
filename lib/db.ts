import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // In production (Vercel) this must be set. In local dev we throw early.
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool =
  global.__dbPool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

if (process.env.NODE_ENV !== "production") {
  global.__dbPool = pool;
}

export async function query(
  text: string,
  params?: any[]
): Promise<{ rows: any[] }> {
  const result = await pool.query(text, params);
  return { rows: result.rows };
}

export { pool };

