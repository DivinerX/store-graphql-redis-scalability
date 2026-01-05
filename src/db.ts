import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_SIZE ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
});

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params);

  const durationMs = Date.now() - start;
  if (durationMs > 100) {
    console.log(`[pg] slow query ${durationMs}ms rows=${res.rowCount} text=${text}`);
  }

  return res.rows as T[];
}
