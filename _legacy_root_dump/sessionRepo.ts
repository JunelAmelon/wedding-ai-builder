import { nanoid } from "nanoid";
import type { WeddingSession, QuizAnswers, AIOutput } from "@/types/domain";
import { localStore } from "@/lib/db/localStore";

const COLLECTION = "sessions";

function useLocal(): boolean {
  return process.env.USE_LOCAL_DB !== "false";
}

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const sessionRepo = {
  async create(): Promise<WeddingSession> {
    const now = new Date().toISOString();
    const session: WeddingSession = {
      id: nanoid(12),
      createdAt: now,
      updatedAt: now,
      status: "in_progress",
      quizAnswers: {},
      aiOutput: null,
      leadId: null,
    };
    if (useLocal()) {
      await localStore.set(COLLECTION, session.id, session);
    } else {
      const col = await getFirestoreCol();
      await col.doc(session.id).set(session);
    }
    return session;
  },

  async get(id: string): Promise<WeddingSession | null> {
    if (useLocal()) {
      return localStore.get<WeddingSession>(COLLECTION, id);
    }
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as WeddingSession) : null;
  },

  async updateAnswers(id: string, partialAnswers: Partial<QuizAnswers>): Promise<WeddingSession> {
    const now = new Date().toISOString();
    if (useLocal()) {
      const existing = await localStore.get<WeddingSession>(COLLECTION, id);
      if (!existing) throw new Error("Session introuvable");
      const merged: WeddingSession = {
        ...existing,
        quizAnswers: { ...existing.quizAnswers, ...partialAnswers },
        updatedAt: now,
      };
      await localStore.set(COLLECTION, id, merged);
      return merged;
    }
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    if (!doc.exists) throw new Error("Session introuvable");
    const existing = doc.data() as WeddingSession;
    const merged: WeddingSession = {
      ...existing,
      quizAnswers: { ...existing.quizAnswers, ...partialAnswers },
      updatedAt: now,
    };
    await col.doc(id).set(merged);
    return merged;
  },

  async markCompleted(id: string): Promise<WeddingSession> {
    return this.setStatus(id, "completed");
  },

  async setStatus(id: string, status: WeddingSession["status"]): Promise<WeddingSession> {
    const now = new Date().toISOString();
    if (useLocal()) {
      return localStore.update<WeddingSession>(COLLECTION, id, { status, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ status, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as WeddingSession;
  },

  async setAIOutput(id: string, aiOutput: AIOutput): Promise<WeddingSession> {
    const now = new Date().toISOString();
    if (useLocal()) {
      return localStore.update<WeddingSession>(COLLECTION, id, { aiOutput, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ aiOutput, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as WeddingSession;
  },

  async linkLead(id: string, leadId: string): Promise<WeddingSession> {
    const now = new Date().toISOString();
    if (useLocal()) {
      return localStore.update<WeddingSession>(COLLECTION, id, { leadId, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ leadId, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as WeddingSession;
  },
};
