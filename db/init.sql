CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revenue_cents INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stores_created_id ON stores (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_stores_revenue ON stores (revenue_cents DESC);

INSERT INTO stores (name, created_at, revenue_cents)
SELECT
  'Store ' || g::text,
  now() - (g || ' hours')::interval,
  (random() * 200000)::int
FROM generate_series(1, 120) g
ON CONFLICT DO NOTHING;
