import { nanoid } from "nanoid";
import type { CreditTransaction } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { useLocal } from "./utils";

const COLLECTION = "credit_transactions";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const creditRepo = {
  async create(data: Omit<CreditTransaction, "id" | "createdAt">): Promise<CreditTransaction> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const transaction: CreditTransaction = { ...data, id, createdAt: now };
    if (useLocal()) {
      await localStore.set(COLLECTION, id, transaction);
      return transaction;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(transaction);
    return transaction;
  },

  async listByVendor(vendorId: string): Promise<CreditTransaction[]> {
    if (useLocal()) {
      const all = await localStore.all<CreditTransaction>(COLLECTION);
      return all.filter((t) => t.vendorId === vendorId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const col = await getFirestoreCol();
    const snap = await col.where("vendorId", "==", vendorId).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as CreditTransaction);
  },

  async get(id: string): Promise<CreditTransaction | null> {
    if (useLocal()) return localStore.get<CreditTransaction>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as CreditTransaction) : null;
  },
};
