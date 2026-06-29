import Redis from "ioredis";

let redisClient: Redis | null = null;
let redisFailed = false;

const memoryStore = new Map<string, { value: string; expiresAt: number }>();

function getRedis(): Redis | null {
  if (redisFailed) return null;
  if (!process.env.REDIS_URL) return null;
  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // pas de retry infini, on bascule en mémoire
        lazyConnect: true,
      });
      redisClient.on("error", () => {
        redisFailed = true;
      });
    } catch {
      redisFailed = true;
      return null;
    }
  }
  return redisClient;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      redisFailed = true;
    }
  }
  // fallback mémoire
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const serialized = JSON.stringify(value);
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key, serialized, "EX", ttlSeconds);
      return;
    } catch {
      redisFailed = true;
    }
  }
  memoryStore.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
}
