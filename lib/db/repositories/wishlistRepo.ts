import { nanoid } from "nanoid";
import type { Wishlist, WishlistItem, WishlistPurchase, WishlistPayout } from "@/types/marketplace";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const WISHLIST_COLLECTION = "wishlists";
const WISHLIST_ITEMS_COLLECTION = "wishlistItems";
const WISHLIST_PURCHASES_COLLECTION = "wishlistPurchases";
const WISHLIST_PAYOUTS_COLLECTION = "wishlistPayouts";

async function getWishlistCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(WISHLIST_COLLECTION);
}

async function getWishlistItemsCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(WISHLIST_ITEMS_COLLECTION);
}

async function getWishlistPurchasesCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(WISHLIST_PURCHASES_COLLECTION);
}

async function getWishlistPayoutsCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(WISHLIST_PAYOUTS_COLLECTION);
}

export const wishlistRepo = {
  async create(data: Omit<Wishlist, "id" | "shareToken" | "createdAt" | "updatedAt">): Promise<Wishlist> {
    const id = nanoid(12);
    const shareToken = nanoid(16);
    const now = new Date().toISOString();
    const wishlist: Wishlist = { ...data, id, shareToken, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(WISHLIST_COLLECTION, id, wishlist);
      return wishlist;
    }
    const col = await getWishlistCol();
    await col.doc(id).set(wishlist);
    return wishlist;
  },

  async listAll(): Promise<Wishlist[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Wishlist>(WISHLIST_COLLECTION);
      return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const col = await getWishlistCol();
    const snap = await col.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as Wishlist);
  },

  async getByCouple(coupleId: string): Promise<Wishlist[]> {
    if (isLocalMode()) {
      const all = await localStore.all<Wishlist>(WISHLIST_COLLECTION);
      return all.filter((w) => w.coupleId === coupleId);
    }
    const col = await getWishlistCol();
    const snap = await col.where("coupleId", "==", coupleId).get();
    return snap.docs.map((d) => d.data() as Wishlist);
  },

  async getByShareToken(shareToken: string): Promise<Wishlist | null> {
    if (isLocalMode()) {
      const all = await localStore.all<Wishlist>(WISHLIST_COLLECTION);
      return all.find((w) => w.shareToken === shareToken) || null;
    }
    const col = await getWishlistCol();
    const snap = await col.where("shareToken", "==", shareToken).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as Wishlist);
  },

  async get(id: string): Promise<Wishlist | null> {
    if (isLocalMode()) return localStore.get<Wishlist>(WISHLIST_COLLECTION, id);
    const col = await getWishlistCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as Wishlist) : null;
  },

  async update(id: string, data: Partial<Wishlist>): Promise<Wishlist> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<Wishlist>(WISHLIST_COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getWishlistCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as Wishlist;
  },

  async delete(id: string): Promise<void> {
    if (isLocalMode()) {
      await localStore.delete(WISHLIST_COLLECTION, id);
      return;
    }
    const col = await getWishlistCol();
    await col.doc(id).delete();
  },
};

export const wishlistItemRepo = {
  async create(data: Omit<WishlistItem, "id" | "createdAt" | "updatedAt">): Promise<WishlistItem> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const item: WishlistItem = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(WISHLIST_ITEMS_COLLECTION, id, item);
      return item;
    }
    const col = await getWishlistItemsCol();
    await col.doc(id).set(item);
    return item;
  },

  async getByWishlist(wishlistId: string): Promise<WishlistItem[]> {
    if (isLocalMode()) {
      const all = await localStore.all<WishlistItem>(WISHLIST_ITEMS_COLLECTION);
      return all.filter((i) => i.wishlistId === wishlistId);
    }
    const col = await getWishlistItemsCol();
    const snap = await col.where("wishlistId", "==", wishlistId).get();
    return snap.docs.map((d) => d.data() as WishlistItem);
  },

  async get(id: string): Promise<WishlistItem | null> {
    if (isLocalMode()) return localStore.get<WishlistItem>(WISHLIST_ITEMS_COLLECTION, id);
    const col = await getWishlistItemsCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as WishlistItem) : null;
  },

  async update(id: string, data: Partial<WishlistItem>): Promise<WishlistItem> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<WishlistItem>(WISHLIST_ITEMS_COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getWishlistItemsCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as WishlistItem;
  },

  async delete(id: string): Promise<void> {
    if (isLocalMode()) {
      await localStore.delete(WISHLIST_ITEMS_COLLECTION, id);
      return;
    }
    const col = await getWishlistItemsCol();
    await col.doc(id).delete();
  },
};

export const wishlistPurchaseRepo = {
  async create(data: Omit<WishlistPurchase, "id" | "createdAt">): Promise<WishlistPurchase> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const purchase: WishlistPurchase = { ...data, id, createdAt: now };
    if (isLocalMode()) {
      await localStore.set(WISHLIST_PURCHASES_COLLECTION, id, purchase);
      return purchase;
    }
    const col = await getWishlistPurchasesCol();
    await col.doc(id).set(purchase);
    return purchase;
  },

  async getByWishlist(wishlistId: string): Promise<WishlistPurchase[]> {
    if (isLocalMode()) {
      const all = await localStore.all<WishlistPurchase>(WISHLIST_PURCHASES_COLLECTION);
      return all.filter((p) => p.wishlistId === wishlistId);
    }
    const col = await getWishlistPurchasesCol();
    const snap = await col.where("wishlistId", "==", wishlistId).get();
    return snap.docs.map((d) => d.data() as WishlistPurchase);
  },

  async getByItem(itemId: string): Promise<WishlistPurchase[]> {
    if (isLocalMode()) {
      const all = await localStore.all<WishlistPurchase>(WISHLIST_PURCHASES_COLLECTION);
      return all.filter((p) => p.itemId === itemId);
    }
    const col = await getWishlistPurchasesCol();
    const snap = await col.where("itemId", "==", itemId).get();
    return snap.docs.map((d) => d.data() as WishlistPurchase);
  },

  async get(id: string): Promise<WishlistPurchase | null> {
    if (isLocalMode()) return localStore.get<WishlistPurchase>(WISHLIST_PURCHASES_COLLECTION, id);
    const col = await getWishlistPurchasesCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as WishlistPurchase) : null;
  },

  async getByStripeSessionId(stripeSessionId: string): Promise<WishlistPurchase | null> {
    if (isLocalMode()) {
      const all = await localStore.all<WishlistPurchase>(WISHLIST_PURCHASES_COLLECTION);
      return all.find((p) => p.stripeSessionId === stripeSessionId) || null;
    }
    const col = await getWishlistPurchasesCol();
    const snap = await col.where("stripeSessionId", "==", stripeSessionId).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as WishlistPurchase);
  },
};

export const wishlistPayoutRepo = {
  async create(data: Omit<WishlistPayout, "id" | "createdAt">): Promise<WishlistPayout> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const payout: WishlistPayout = { ...data, id, createdAt: now };
    if (isLocalMode()) {
      await localStore.set(WISHLIST_PAYOUTS_COLLECTION, id, payout);
      return payout;
    }
    const col = await getWishlistPayoutsCol();
    await col.doc(id).set(payout);
    return payout;
  },

  async getByWishlist(wishlistId: string): Promise<WishlistPayout[]> {
    if (isLocalMode()) {
      const all = await localStore.all<WishlistPayout>(WISHLIST_PAYOUTS_COLLECTION);
      return all.filter((p) => p.wishlistId === wishlistId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const col = await getWishlistPayoutsCol();
    const snap = await col.where("wishlistId", "==", wishlistId).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as WishlistPayout);
  },

  async listAll(): Promise<WishlistPayout[]> {
    if (isLocalMode()) {
      const all = await localStore.all<WishlistPayout>(WISHLIST_PAYOUTS_COLLECTION);
      return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const col = await getWishlistPayoutsCol();
    const snap = await col.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as WishlistPayout);
  },

  async get(id: string): Promise<WishlistPayout | null> {
    if (isLocalMode()) return localStore.get<WishlistPayout>(WISHLIST_PAYOUTS_COLLECTION, id);
    const col = await getWishlistPayoutsCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as WishlistPayout) : null;
  },
};
