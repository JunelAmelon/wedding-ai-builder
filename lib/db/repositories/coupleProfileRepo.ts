import { nanoid } from "nanoid";
import type { CoupleProfile } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { useLocal } from "./utils";

const COLLECTION = "couple_profiles";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const coupleProfileRepo = {
  async create(data: Omit<CoupleProfile, "id" | "createdAt" | "updatedAt">): Promise<CoupleProfile> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const profile: CoupleProfile = { ...data, id, createdAt: now, updatedAt: now };
    if (useLocal()) {
      await localStore.set(COLLECTION, id, profile);
      return profile;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(profile);
    return profile;
  },

  async list(): Promise<CoupleProfile[]> {
    if (useLocal()) return localStore.all<CoupleProfile>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as CoupleProfile);
  },

  async get(id: string): Promise<CoupleProfile | null> {
    if (useLocal()) return localStore.get<CoupleProfile>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as CoupleProfile) : null;
  },

  async getByUserId(userId: string): Promise<CoupleProfile | null> {
    if (useLocal()) {
      const all = await localStore.all<CoupleProfile>(COLLECTION);
      return all.find((p) => p.userId === userId) ?? null;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("userId", "==", userId).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as CoupleProfile);
  },

  async update(id: string, data: Partial<CoupleProfile>): Promise<CoupleProfile> {
    const now = new Date().toISOString();
    if (useLocal()) {
      return localStore.update<CoupleProfile>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as CoupleProfile;
  },
};
