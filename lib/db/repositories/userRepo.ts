import { nanoid } from "nanoid";
import type { UserAccount } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "users";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const userRepo = {
  async create(data: Omit<UserAccount, "id" | "createdAt" | "updatedAt">): Promise<UserAccount> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const user: UserAccount = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, user);
      return user;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(user);
    return user;
  },

  async list(): Promise<UserAccount[]> {
    if (isLocalMode()) return localStore.all<UserAccount>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as UserAccount);
  },

  async get(id: string): Promise<UserAccount | null> {
    if (isLocalMode()) return localStore.get<UserAccount>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as UserAccount) : null;
  },

  async getByEmail(email: string): Promise<UserAccount | null> {
    const normalized = email.toLowerCase();
    if (isLocalMode()) {
      const all = await localStore.all<UserAccount>(COLLECTION);
      return all.find((u) => u.email.toLowerCase() === normalized) ?? null;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("email", "==", normalized).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as UserAccount);
  },

  async getByGoogleId(googleId: string): Promise<UserAccount | null> {
    if (isLocalMode()) {
      const all = await localStore.all<UserAccount>(COLLECTION);
      return all.find((u) => u.googleId === googleId) ?? null;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("googleId", "==", googleId).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as UserAccount);
  },

  async update(id: string, data: Partial<UserAccount>): Promise<UserAccount> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<UserAccount>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as UserAccount;
  },
};
