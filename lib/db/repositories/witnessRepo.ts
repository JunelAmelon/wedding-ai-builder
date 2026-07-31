import { nanoid } from "nanoid";
import type { Witness } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "witnesses";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const witnessRepo = {
  async create(data: Omit<Witness, "id" | "createdAt" | "updatedAt">): Promise<Witness> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const witness: Witness = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, witness);
      return witness;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(witness);
    return witness;
  },

  async listByProject(projectId: string): Promise<Witness[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Witness>(COLLECTION);
      return all.filter((w) => w.projectId === projectId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    return snap.docs.map((d) => d.data() as Witness);
  },

  async get(id: string): Promise<Witness | null> {
    if (isLocalMode()) return localStore.get<Witness>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as Witness) : null;
  },

  async update(id: string, data: Partial<Witness>): Promise<Witness> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<Witness>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as Witness;
  },

  async delete(id: string): Promise<void> {
    if (isLocalMode()) {
      await localStore.delete(COLLECTION, id);
      return;
    }
    const col = await getFirestoreCol();
    await col.doc(id).delete();
  },
};
