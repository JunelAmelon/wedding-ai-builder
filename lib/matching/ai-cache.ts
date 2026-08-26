import crypto from "crypto";
import { getCached, setCached } from "@/lib/cache/redis";
import type { MatchAiCache, MatchScore } from "@/lib/matching/engine";

function makeKey(vendorId: string, projectId: string, category: string, projectUpdatedAt: string | undefined): string {
  const base = `${vendorId}:${projectId}:${category}:${projectUpdatedAt ?? ""}`;
  return `match:ai:${crypto.createHash("sha256").update(base).digest("hex").slice(0, 24)}`;
}

export function createMatchAiCache(projectId: string, category: string, projectUpdatedAt: string | undefined): MatchAiCache {
  return {
    async get(vendorId: string): Promise<MatchScore | null> {
      return getCached<MatchScore>(makeKey(vendorId, projectId, category, projectUpdatedAt));
    },
    async set(vendorId: string, value: MatchScore): Promise<void> {
      await setCached(makeKey(vendorId, projectId, category, projectUpdatedAt), value, 60 * 60); // 1 hour
    },
  };
}
