import { nanoid } from "nanoid";
import type { WeddingProject } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "wedding_projects";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const projectRepo = {
  async create(data: Omit<WeddingProject, "id" | "createdAt" | "updatedAt">): Promise<WeddingProject> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const project: WeddingProject = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, project);
      return project;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(project);
    return project;
  },

  async list(): Promise<WeddingProject[]> {
    if (isLocalMode()) return localStore.all<WeddingProject>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as WeddingProject);
  },

  async listByUser(userId: string): Promise<WeddingProject[]> {
    if (isLocalMode()) {
      const all = await localStore.all<WeddingProject>(COLLECTION);
      return all.filter((p) => p.userId === userId);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("userId", "==", userId).get();
    return snap.docs.map((d) => d.data() as WeddingProject);
  },

  async get(id: string): Promise<WeddingProject | null> {
    if (isLocalMode()) return localStore.get<WeddingProject>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as WeddingProject) : null;
  },

  async update(id: string, data: Partial<WeddingProject>): Promise<WeddingProject> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<WeddingProject>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as WeddingProject;
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
