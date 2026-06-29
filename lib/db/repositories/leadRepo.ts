import { nanoid } from "nanoid";
import type { Lead } from "@/types/domain";
import { localStore } from "@/lib/db/localStore";
import { useLocal } from "./utils";

const COLLECTION = "leads";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const leadRepo = {
  async create(input: {
    sessionId: string;
    email: string;
    whatsapp: string | null;
    source: Lead["source"];
    consentMarketing: boolean;
  }): Promise<Lead> {
    const lead: Lead = {
      id: nanoid(12),
      sessionId: input.sessionId,
      email: input.email,
      whatsapp: input.whatsapp,
      capturedAt: new Date().toISOString(),
      source: input.source,
      ctaClicked: [],
      consentMarketing: input.consentMarketing,
    };
    if (useLocal()) {
      await localStore.set(COLLECTION, lead.id, lead);
    } else {
      const col = await getFirestoreCol();
      await col.doc(lead.id).set(lead);
    }
    return lead;
  },

  async get(id: string): Promise<Lead | null> {
    if (useLocal()) return localStore.get<Lead>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as Lead) : null;
  },

  async findByEmail(email: string): Promise<Lead | null> {
    if (useLocal()) {
      return localStore.findOne<Lead>(COLLECTION, (l) => l.email === email);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("email", "==", email).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as Lead);
  },

  async list(): Promise<Lead[]> {
    if (useLocal()) {
      return localStore.all<Lead>(COLLECTION);
    }
    const col = await getFirestoreCol();
    const snap = await col.orderBy("capturedAt", "desc").get();
    return snap.docs.map((d) => d.data() as Lead);
  },

  async addCtaClick(id: string, ctaLabel: string): Promise<void> {
    if (useLocal()) {
      const lead = await localStore.get<Lead>(COLLECTION, id);
      if (!lead) return;
      const updated = [...new Set([...lead.ctaClicked, ctaLabel])];
      await localStore.update<Lead>(COLLECTION, id, { ctaClicked: updated });
      return;
    }
    const col = await getFirestoreCol();
    const { FieldValue } = await import("firebase-admin/firestore");
    await col.doc(id).update({ ctaClicked: FieldValue.arrayUnion(ctaLabel) });
  },
};
