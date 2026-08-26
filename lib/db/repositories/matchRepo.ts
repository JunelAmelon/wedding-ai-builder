import { nanoid } from "nanoid";
import type { ProjectVendorMatch } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "project_vendor_matches";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const matchRepo = {
  async create(data: Omit<ProjectVendorMatch, "id" | "createdAt" | "updatedAt">): Promise<ProjectVendorMatch> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const match: ProjectVendorMatch = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, match);
      return match;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(match);
    return match;
  },

  async list(): Promise<ProjectVendorMatch[]> {
    if (isLocalMode()) return localStore.all<ProjectVendorMatch>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as ProjectVendorMatch);
  },

  async listByProject(projectId: string): Promise<ProjectVendorMatch[]> {
    if (isLocalMode()) {
      const all = await localStore.all<ProjectVendorMatch>(COLLECTION);
      return all.filter((m) => m.projectId === projectId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    return snap.docs.map((d) => d.data() as ProjectVendorMatch);
  },

  async listByVendor(vendorId: string): Promise<ProjectVendorMatch[]> {
    if (isLocalMode()) {
      const all = await localStore.all<ProjectVendorMatch>(COLLECTION);
      return all.filter((m) => m.vendorId === vendorId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("vendorId", "==", vendorId).get();
    return snap.docs.map((d) => d.data() as ProjectVendorMatch);
  },

  async get(id: string): Promise<ProjectVendorMatch | null> {
    if (isLocalMode()) return localStore.get<ProjectVendorMatch>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as ProjectVendorMatch) : null;
  },

  async update(id: string, data: Partial<ProjectVendorMatch>): Promise<ProjectVendorMatch> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<ProjectVendorMatch>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as ProjectVendorMatch;
  },

  async deleteByProject(projectId: string): Promise<void> {
    if (isLocalMode()) {
      const all = await localStore.all<ProjectVendorMatch>(COLLECTION);
      const toDelete = all.filter((m) => m.projectId === projectId);
      await Promise.all(toDelete.map((m) => localStore.delete(COLLECTION, m.id)));
      return;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },

  async deleteByProjectAndCategory(projectId: string, category: string): Promise<void> {
    if (isLocalMode()) {
      const all = await localStore.all<ProjectVendorMatch>(COLLECTION);
      const toDelete = all.filter((m) => m.projectId === projectId && m.category === category);
      await Promise.all(toDelete.map((m) => localStore.delete(COLLECTION, m.id)));
      return;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).where("category", "==", category).get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },

  async deleteSuggestedByProject(projectId: string): Promise<void> {
    if (isLocalMode()) {
      const all = await localStore.all<ProjectVendorMatch>(COLLECTION);
      const toDelete = all.filter((m) => m.projectId === projectId && m.status === "suggested");
      await Promise.all(toDelete.map((m) => localStore.delete(COLLECTION, m.id)));
      return;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).where("status", "==", "suggested").get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },
};
