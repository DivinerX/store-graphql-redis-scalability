# Stores GraphQL API (Performance + Scalability Sample)

A TypeScript GraphQL API demonstrating production-minded performance patterns:
- Keyset cursor pagination (avoids OFFSET slowdown on large tables)
- Redis caching for hot queries
- Request coalescing to prevent cache stampedes under concurrency
- DataLoader batching to prevent N+1 queries
- Postgres indexes aligned with query paths
- Docker Compose for local reproducibility

## Tech
TypeScript, GraphQL Yoga, Postgres, Redis, Docker

## Run locally
```bash
docker-compose up --build
