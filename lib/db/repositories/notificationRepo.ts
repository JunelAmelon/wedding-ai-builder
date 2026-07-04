import { nanoid } from "nanoid";
import type { Notification } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { useLocal } from "./utils";

const COLLECTION = "notifications";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const notificationRepo = {
  async create(data: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const notification: Notification = { ...data, id, read: false, createdAt: now };
    if (useLocal()) {
      await localStore.set(COLLECTION, id, notification);
      return notification;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(notification);
    return notification;
  },

  async listByUser(userId: string): Promise<Notification[]> {
    if (useLocal()) {
      const all = await localStore.all<Notification>(COLLECTION);
      return all.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const col = await getFirestoreCol();
    const snap = await col.where("userId", "==", userId).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as Notification);
  },

  async listUnreadByUser(userId: string): Promise<Notification[]> {
    if (useLocal()) {
      const all = await localStore.all<Notification>(COLLECTION);
      return all.filter((n) => n.userId === userId && !n.read).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const col = await getFirestoreCol();
    const snap = await col.where("userId", "==", userId).where("read", "==", false).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as Notification);
  },

  async get(id: string): Promise<Notification | null> {
    if (useLocal()) return localStore.get<Notification>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as Notification) : null;
  },

  async markAsRead(id: string): Promise<Notification> {
    if (useLocal()) {
      return localStore.update<Notification>(COLLECTION, id, { read: true });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ read: true });
    const doc = await col.doc(id).get();
    return doc.data() as Notification;
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (useLocal()) {
      const all = await localStore.all<Notification>(COLLECTION);
      const toUpdate = all.filter((n) => n.userId === userId && !n.read);
      await Promise.all(toUpdate.map((n) => localStore.update<Notification>(COLLECTION, n.id, { read: true })));
      return;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("userId", "==", userId).where("read", "==", false).get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
    await batch.commit();
  },
};
