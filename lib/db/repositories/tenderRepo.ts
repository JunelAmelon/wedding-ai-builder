import { nanoid } from "nanoid";
import type { Tender } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "tenders";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const tenderRepo = {
  async create(data: Omit<Tender, "id" | "createdAt" | "updatedAt">): Promise<Tender> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const tender: Tender = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, tender);
      return tender;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(tender);
    return tender;
  },

  async list(): Promise<Tender[]> {
    if (isLocalMode()) return localStore.all<Tender>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as Tender);
  },

  async listByProject(projectId: string): Promise<Tender[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Tender>(COLLECTION);
      return all.filter((t) => t.projectId === projectId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    return snap.docs.map((d) => d.data() as Tender);
  },

  async get(id: string): Promise<Tender | null> {
    if (isLocalMode()) return localStore.get<Tender>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as Tender) : null;
  },

  async update(id: string, data: Partial<Tender>): Promise<Tender> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<Tender>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as Tender;
  },
};
