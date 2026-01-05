import { createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { schema } from "./schema";
import { initRedis } from "./redis";
import { makeLoaders } from "./loaders";

async function main() {
  await initRedis();

  const yoga = createYoga({
    schema,
    context: async () => ({ loaders: makeLoaders() })
  });

  const server = createServer(async (req, res) => {
    if (req.url === "/health") {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    return yoga(req, res);
  });

  const port = Number(process.env.PORT ?? 4000);
  server.listen(port, () => {
    console.log(`API ready at http://localhost:${port}/graphql`);
    console.log(`Health at http://localhost:${port}/health`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
