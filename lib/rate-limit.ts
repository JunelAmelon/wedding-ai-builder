import { getCached, setCached } from "./cache/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const cacheKey = `rate:${key}`;

  const current = await getCached<{ count: number; resetAt: number }>(cacheKey);
  if (!current || current.resetAt < now) {
    await setCached(cacheKey, { count: 1, resetAt }, windowSeconds);
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  const nextCount = current.count + 1;
  const ttl = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  await setCached(cacheKey, { ...current, count: nextCount }, ttl);

  return {
    allowed: nextCount <= limit,
    remaining: Math.max(0, limit - nextCount),
    resetAt: current.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "anonymous";
}
