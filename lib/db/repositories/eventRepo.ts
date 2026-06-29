import { nanoid } from "nanoid";
import { localStore } from "@/lib/db/localStore";

const COLLECTION = "events";

function normalizeEnvBool(value: string | undefined): boolean {
  if (!value) return true;
  const cleaned = value.trim().replace(/^["']|["']$/g, "");
  return cleaned.toLowerCase() !== "false";
}

function useLocal(): boolean {
  return normalizeEnvBool(process.env.USE_LOCAL_DB);
}

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export interface AppEvent {
  id: string;
  sessionId: string;
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export const eventRepo = {
  async log(sessionId: string, name: string, properties: Record<string, unknown> = {}): Promise<void> {
    const event: AppEvent = {
      id: nanoid(12),
      sessionId,
      name,
      properties,
      timestamp: new Date().toISOString(),
    };
    if (useLocal()) {
      await localStore.set(COLLECTION, event.id, event);
      return;
    }
    const col = await getFirestoreCol();
    await col.doc(event.id).set(event);
  },

  async listBySession(sessionId: string): Promise<AppEvent[]> {
    if (useLocal()) {
      const all = await localStore.all<AppEvent>(COLLECTION);
      return all.filter((e) => e.sessionId === sessionId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("sessionId", "==", sessionId).get();
    return snap.docs.map((d) => d.data() as AppEvent);
  },
};
