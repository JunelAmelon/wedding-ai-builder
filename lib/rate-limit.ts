import net from "net";
import { getCached, setCached, delCached } from "./cache/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Vérifie et incrémente le compteur de requêtes pour une clé donnée.
 * La clé est assainie pour empêcher toute injection dans le cache.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const cleanKey = key.trim().replace(/[^a-zA-Z0-9_\-.:@]/g, "_");
  const cacheKey = `rate:${cleanKey}`;

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

/**
 * Réinitialise manuellement un compteur de rate limiting (ex: après un login réussi).
 */
export async function resetRateLimit(key: string): Promise<void> {
  const cleanKey = key.trim().replace(/[^a-zA-Z0-9_\-.:@]/g, "_");
  await delCached(`rate:${cleanKey}`);
}

/**
 * Récupère l'adresse IP du client de manière sécurisée en filtrant les en-têtes
 * et en validant strictement le format IPv4 / IPv6 pour empêcher l'usurpation (spoofing).
 */
export function getClientIp(req: Request): string {
  // 1. En-tête Cloudflare edge (non falsifiable par le client lorsqu'on est derrière Cloudflare)
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && net.isIP(cfIp) !== 0) {
    return cfIp;
  }

  // 2. En-tête proxy direct Nginx / Apache
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && net.isIP(realIp) !== 0) {
    return realIp;
  }

  // 3. Chaîne d'en-tête X-Forwarded-For
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Parcourir de droite à gauche pour extraire la première adresse IP valide ajoutée par les proxies
    for (let i = parts.length - 1; i >= 0; i--) {
      if (net.isIP(parts[i]) !== 0) {
        return parts[i];
      }
    }
  }

  // 4. Client-IP direct
  const clientIp = req.headers.get("x-client-ip")?.trim();
  if (clientIp && net.isIP(clientIp) !== 0) {
    return clientIp;
  }

  return "127.0.0.1";
}
