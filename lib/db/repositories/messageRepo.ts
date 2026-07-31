import { nanoid } from "nanoid";
import type { Message } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "messages";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const messageRepo = {
  async create(data: Omit<Message, "id" | "createdAt">): Promise<Message> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const message: Message = { ...data, id, createdAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, message);
      return message;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(message);
    return message;
  },

  async listByProposal(proposalId: string): Promise<Message[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Message>(COLLECTION);
      return all.filter((m) => m.proposalId === proposalId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    const col = await getFirestoreCol();
    const snap = await col.where("proposalId", "==", proposalId).orderBy("createdAt", "asc").get();
    return snap.docs.map((d) => d.data() as Message);
  },

  async listByUser(userId: string): Promise<Message[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Message>(COLLECTION);
      return all.filter((m) => m.senderId === userId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    const col = await getFirestoreCol();
    const snap = await col.where("senderId", "==", userId).orderBy("createdAt", "asc").get();
    return snap.docs.map((d) => d.data() as Message);
  },

  async markAsRead(proposalId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      const all = await localStore.all<Message>(COLLECTION);
      const toUpdate = all.filter((m) => m.proposalId === proposalId && m.senderId !== userId && !m.readAt);
      await Promise.all(toUpdate.map((m) => localStore.update<Message>(COLLECTION, m.id, { readAt: now })));
      return;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("proposalId", "==", proposalId).where("senderId", "!=", userId).get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.update(doc.ref, { readAt: now }));
    await batch.commit();
  },
};
