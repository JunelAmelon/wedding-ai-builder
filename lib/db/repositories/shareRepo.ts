import { nanoid } from "nanoid";
import type { ShareRecord } from "@/types/domain";
import { localStore } from "@/lib/db/localStore";

const COLLECTION = "shares";

function useLocal(): boolean {
  return process.env.USE_LOCAL_DB !== "false";
}

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const shareRepo = {
  async create(sessionId: string, riskScore: number): Promise<ShareRecord> {
    const record: ShareRecord = {
      slug: nanoid(8),
      sessionId,
      riskScore,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    };
    if (useLocal()) {
      await localStore.set(COLLECTION, record.slug, record);
    } else {
      const col = await getFirestoreCol();
      await col.doc(record.slug).set(record);
    }
    return record;
  },

  async get(slug: string): Promise<ShareRecord | null> {
    if (useLocal()) return localStore.get<ShareRecord>(COLLECTION, slug);
    const col = await getFirestoreCol();
    const doc = await col.doc(slug).get();
    return doc.exists ? (doc.data() as ShareRecord) : null;
  },

  async incrementView(slug: string): Promise<void> {
    if (useLocal()) {
      const record = await localStore.get<ShareRecord>(COLLECTION, slug);
      if (!record) return;
      await localStore.update<ShareRecord>(COLLECTION, slug, { viewCount: record.viewCount + 1 });
      return;
    }
    const col = await getFirestoreCol();
    const { FieldValue } = await import("firebase-admin/firestore");
    await col.doc(slug).update({ viewCount: FieldValue.increment(1) });
  },
};
