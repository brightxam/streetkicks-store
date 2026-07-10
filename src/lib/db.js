import { Pool } from "pg";

let pool;

// Lazily create a single shared connection pool (serverless-friendly:
// re-used across invocations of the same warm function instance).
export function getPool() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        "POSTGRES_URL is not set. Connect a Postgres database to this project in Vercel > Storage."
      );
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}
