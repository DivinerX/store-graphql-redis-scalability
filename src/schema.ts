import { createSchema } from "graphql-yoga";
import { query } from "./db";
import { getOrSetJson } from "./cache";
import type { StoreRow, Loaders } from "./loaders";

type Context = { loaders: Loaders };

function toStore(r: StoreRow) {
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    revenueCents: r.revenue_cents
  };
}

function encodeCursor(createdAt: string, id: string) {
  return Buffer.from(`${createdAt}|${id}`).toString("base64");
}
function decodeCursor(cursor: string) {
  const [createdAt, id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
  return { createdAt, id };
}

export const schema = createSchema<Context>({
  typeDefs: /* GraphQL */ `
    type Store {
      id: ID!
      name: String!
      createdAt: String!
      revenueCents: Int!
    }

    type StoreEdge {
      node: Store!
      cursor: String!
    }

    type PageInfo {
      endCursor: String
      hasNextPage: Boolean!
    }

    type StoreConnection {
      edges: [StoreEdge!]!
      pageInfo: PageInfo!
    }

    type Query {
      store(id: ID!): Store
      stores(first: Int! = 20, after: String): StoreConnection!
      topStoresByRevenue(limit: Int! = 10): [Store!]!
    }
  `,
  resolvers: {
    Query: {
      store: async (_parent, args: { id: string }, ctx) => {
        const row = await ctx.loaders.storeById.load(args.id);
        return row ? toStore(row) : null;
      },

      // Keyset pagination: scales better than OFFSET for large tables
      stores: async (_parent, args: { first: number; after?: string | null }) => {
        const limit = Math.min(args.first ?? 20, 50);

        let whereSql = "";
        const params: any[] = [];

        if (args.after) {
          const { createdAt, id } = decodeCursor(args.after);
          params.push(createdAt, id);
          whereSql = `WHERE (created_at, id) < ($1::timestamptz, $2::uuid)`;
        }

        params.push(limit + 1);

        const rows = await query<StoreRow>(
          `SELECT id, name, created_at, revenue_cents
           FROM stores
           ${whereSql}
           ORDER BY created_at DESC, id DESC
           LIMIT $${params.length}`,
          params
        );

        const hasNextPage = rows.length > limit;
        const sliced = rows.slice(0, limit);

        const edges = sliced.map((r) => ({
          node: toStore(r),
          cursor: encodeCursor(r.created_at, r.id)
        }));

        return {
          edges,
          pageInfo: {
            endCursor: edges.length ? edges[edges.length - 1].cursor : null,
            hasNextPage
          }
        };
      },

      // Cached hot-path query for a leaderboard style view
      topStoresByRevenue: async (_parent, args: { limit: number }) => {
        const limit = Math.min(args.limit ?? 10, 50);
        const ttl = Number(process.env.CACHE_TTL_SECONDS ?? 30);
        const cacheKey = `topStoresByRevenue:v1:limit=${limit}`;

        const result = await getOrSetJson(cacheKey, ttl, async () => {
          const rows = await query<StoreRow>(
            `SELECT id, name, created_at, revenue_cents
             FROM stores
             ORDER BY revenue_cents DESC
             LIMIT $1`,
            [limit]
          );
          return rows.map(toStore);
        });

        if (result.cache === "miss") console.log(`[cache] miss ${cacheKey}`);
        return result.value;
      }
    }
  }
});
