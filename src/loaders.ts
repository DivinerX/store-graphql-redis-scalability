import DataLoader from "dataloader";
import { query } from "./db";

export type StoreRow = {
  id: string;
  name: string;
  created_at: string;
  revenue_cents: number;
};

export function makeLoaders() {
  const storeById = new DataLoader<string, StoreRow | null>(async (ids) => {
    const rows = await query<StoreRow>(
      `SELECT id, name, created_at, revenue_cents
       FROM stores
       WHERE id = ANY($1::uuid[])`,
      [ids]
    );

    const map = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => map.get(id) ?? null);
  });

  return { storeById };
}

export type Loaders = ReturnType<typeof makeLoaders>;
