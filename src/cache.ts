import { redis } from "./redis";

const inFlight = new Map<string, Promise<string>>();

export async function getOrSetJson<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<{ value: T; cache: "hit" | "miss" }> {
  const cached = await redis.get(key);
  if (cached) return { value: JSON.parse(cached) as T, cache: "hit" };

  const existing = inFlight.get(key);
  if (existing) {
    const payload = await existing;
    return { value: JSON.parse(payload) as T, cache: "hit" };
  }

  const promise = (async () => {
    const value = await compute();
    const payload = JSON.stringify(value);
    await redis.set(key, payload, { EX: ttlSeconds });
    return payload;
  })();

  inFlight.set(key, promise);

  try {
    const payload = await promise;
    return { value: JSON.parse(payload) as T, cache: "miss" };
  } finally {
    inFlight.delete(key);
  }
}
