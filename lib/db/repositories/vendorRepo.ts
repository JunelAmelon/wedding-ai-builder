import { nanoid } from "nanoid";
import type { VendorApplication } from "@/types/domain";
import { localStore } from "@/lib/db/localStore";
import { useLocal } from "./utils";

const COLLECTION = "vendor_applications";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const vendorRepo = {
  async create(data: Omit<VendorApplication, "id" | "createdAt" | "status" | "reviewedAt" | "reviewedBy" | "notes">): Promise<VendorApplication> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const application: VendorApplication = {
      ...data,
      id,
      createdAt: now,
      status: "pending",
      reviewedAt: null,
      reviewedBy: null,
      notes: null,
    };
    if (useLocal()) {
      await localStore.set(COLLECTION, id, application);
      return application;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(application);
    return application;
  },

  async list(): Promise<VendorApplication[]> {
    if (useLocal()) {
      return localStore.all<VendorApplication>(COLLECTION);
    }
    const col = await getFirestoreCol();
    const snap = await col.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as VendorApplication);
  },

  async get(id: string): Promise<VendorApplication | null> {
    if (useLocal()) return localStore.get<VendorApplication>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as VendorApplication) : null;
  },

  async updateStatus(id: string, status: VendorApplication["status"], notes: string | null, reviewer: string): Promise<VendorApplication> {
    const now = new Date().toISOString();
    if (useLocal()) {
      return localStore.update<VendorApplication>(COLLECTION, id, { status, notes, reviewedAt: now, reviewedBy: reviewer });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ status, notes, reviewedAt: now, reviewedBy: reviewer });
    const doc = await col.doc(id).get();
    return doc.data() as VendorApplication;
  },
};
