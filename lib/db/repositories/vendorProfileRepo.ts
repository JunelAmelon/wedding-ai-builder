import { nanoid } from "nanoid";
import type { VendorProfile } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "vendor_profiles";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const vendorProfileRepo = {
  async create(data: Omit<VendorProfile, "id" | "createdAt" | "updatedAt" | "credits" | "profileCompletion" | "verified">): Promise<VendorProfile> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const profile: VendorProfile = {
      ...data,
      id,
      credits: 0,
      profileCompletion: 0,
      verified: false,
      createdAt: now,
      updatedAt: now,
    };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, profile);
      return profile;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(profile);
    return profile;
  },

  async list(): Promise<VendorProfile[]> {
    if (isLocalMode()) return localStore.all<VendorProfile>(COLLECTION);
    const col = await getFirestoreCol();
    const snap = await col.get();
    return snap.docs.map((d) => d.data() as VendorProfile);
  },

  async listApproved(): Promise<VendorProfile[]> {
    if (isLocalMode()) {
      const all = await localStore.all<VendorProfile>(COLLECTION);
      return all.filter((p) => p.status === "approved");
    }
    const col = await getFirestoreCol();
    const snap = await col.where("status", "==", "approved").get();
    return snap.docs.map((d) => d.data() as VendorProfile);
  },

  async get(id: string): Promise<VendorProfile | null> {
    if (isLocalMode()) return localStore.get<VendorProfile>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as VendorProfile) : null;
  },

  async getByUserId(userId: string): Promise<VendorProfile | null> {
    if (isLocalMode()) {
      const all = await localStore.all<VendorProfile>(COLLECTION);
      return all.find((p) => p.userId === userId) ?? null;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("userId", "==", userId).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as VendorProfile);
  },

  async update(id: string, data: Partial<VendorProfile>): Promise<VendorProfile> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<VendorProfile>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as VendorProfile;
  },

  async updateCredits(id: string, credits: number): Promise<VendorProfile> {
    return this.update(id, { credits });
  },
};
