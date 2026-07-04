import { nanoid } from "nanoid";
import type { WeddingExpense } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { useLocal } from "./utils";

const COLLECTION = "wedding_expenses";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const expenseRepo = {
  async create(data: Omit<WeddingExpense, "id" | "createdAt" | "updatedAt">): Promise<WeddingExpense> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const expense: WeddingExpense = { ...data, id, createdAt: now, updatedAt: now };
    if (useLocal()) {
      await localStore.set(COLLECTION, id, expense);
      return expense;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(expense);
    return expense;
  },

  async listByProject(projectId: string): Promise<WeddingExpense[]> {
    if (useLocal()) {
      const all = await localStore.all<WeddingExpense>(COLLECTION);
      return all.filter((e) => e.projectId === projectId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    return snap.docs.map((d) => d.data() as WeddingExpense);
  },

  async get(id: string): Promise<WeddingExpense | null> {
    if (useLocal()) return localStore.get<WeddingExpense>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as WeddingExpense) : null;
  },

  async update(id: string, data: Partial<WeddingExpense>): Promise<WeddingExpense> {
    const now = new Date().toISOString();
    if (useLocal()) {
      return localStore.update<WeddingExpense>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as WeddingExpense;
  },

  async delete(id: string): Promise<void> {
    if (useLocal()) {
      await localStore.delete(COLLECTION, id);
      return;
    }
    const col = await getFirestoreCol();
    await col.doc(id).delete();
  },
};
