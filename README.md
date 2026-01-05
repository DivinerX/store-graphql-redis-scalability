# Stores GraphQL API (Performance + Scalability Sample)

A TypeScript GraphQL API demonstrating production-minded performance patterns for high-traffic scenarios.

## 🚀 Key Features

- **Keyset Cursor Pagination**: Avoids OFFSET slowdown on large tables for consistent query performance
- **Redis Caching**: Fast retrieval for hot queries with smart cache invalidation
- **Request Coalescing**: Prevents cache stampedes under high concurrency
- **DataLoader Batching**: Eliminates N+1 queries with intelligent batching
- **Optimized Postgres Indexes**: Indexes aligned with query paths for maximum efficiency
- **Docker Compose**: Full local reproducibility with containerized services

## 🛠 Tech Stack

- **Language**: TypeScript
- **GraphQL Server**: GraphQL Yoga
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose

## 📦 Project Structure

```
stores-graphql-api-performance/
├── src/
│   ├── index.ts      # Server entry point
│   ├── schema.ts     # GraphQL schema & resolvers
│   ├── loaders.ts    # DataLoader implementations
│   ├── cache.ts      # Redis caching logic
│   ├── redis.ts      # Redis client configuration
│   └── db.ts         # PostgreSQL connection pool
├── db/
│   └── init.sql      # Database initialization script
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (if running locally without Docker)

### Run with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, and API)
docker-compose up --build

# API will be available at http://localhost:4000
```

### Run Locally (Development)

```bash
# Install dependencies
npm install

# Make sure PostgreSQL and Redis are running
# Update connection strings in src/db.ts and src/redis.ts if needed

# Start the development server
npm run dev
```

## 🔍 Example Queries

Once the server is running, navigate to `http://localhost:4000/graphql` to access the GraphQL Playground.

### Query: Get Stores with Pagination

```graphql
query GetStores {
  stores(first: 10) {
    edges {
      cursor
      node {
        id
        name
        city
        state
        country
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Query: Get Store by ID

```graphql
query GetStore {
  store(id: 1) {
    id
    name
    city
    state
    country
  }
}
```

## 🔧 Configuration

The application uses the following default ports:
- **GraphQL API**: 4000
- **PostgreSQL**: 5432
- **Redis**: 6379

You can customize these in `docker-compose.yml` or through environment variables.

## 📊 Performance Features Explained

### Cursor-Based Pagination
Uses keyset pagination instead of OFFSET/LIMIT to maintain consistent performance regardless of page depth.

### Caching Strategy
- Hot queries are cached in Redis with configurable TTL
- Request coalescing ensures only one request hits the database when multiple concurrent requests ask for the same data

### DataLoader
Batches and caches database requests within a single GraphQL request to eliminate N+1 query problems.

## 📝 License

MIT

## 🤝 Contributing

This is a sample/demo project showcasing GraphQL performance patterns. Feel free to use it as a reference for your own implementations.
