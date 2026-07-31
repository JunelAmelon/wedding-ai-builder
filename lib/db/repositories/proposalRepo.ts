import { nanoid } from "nanoid";
import type { Proposal } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "proposals";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const proposalRepo = {
  async create(data: Omit<Proposal, "id" | "createdAt" | "updatedAt">): Promise<Proposal> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const proposal: Proposal = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, proposal);
      return proposal;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(proposal);
    return proposal;
  },

  async list(): Promise<Proposal[]> {
    if (isLocalMode()) return localStore.all<Proposal>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as Proposal);
  },

  async listByProject(projectId: string): Promise<Proposal[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Proposal>(COLLECTION);
      return all.filter((p) => p.projectId === projectId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    return snap.docs.map((d) => d.data() as Proposal);
  },

  async listByVendor(vendorId: string): Promise<Proposal[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Proposal>(COLLECTION);
      return all.filter((p) => p.vendorId === vendorId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("vendorId", "==", vendorId).get();
    return snap.docs.map((d) => d.data() as Proposal);
  },

  async listByTender(tenderId: string): Promise<Proposal[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Proposal>(COLLECTION);
      return all.filter((p) => p.tenderId === tenderId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("tenderId", "==", tenderId).get();
    return snap.docs.map((d) => d.data() as Proposal);
  },

  async get(id: string): Promise<Proposal | null> {
    if (isLocalMode()) return localStore.get<Proposal>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as Proposal) : null;
  },

  async update(id: string, data: Partial<Proposal>): Promise<Proposal> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<Proposal>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as Proposal;
  },
};
