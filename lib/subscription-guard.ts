import { adminRepo } from "@/lib/db/repositories/adminRepo";
import type { UserSubscription } from "@/types/admin";
import type { VendorProfile } from "@/types/marketplace";

export type SubscriptionGuardResult =
  | { ok: true; subscription: UserSubscription }
  | { ok: false; reason: "no_subscription" | "expired" | "past_due" | "unpaid" | "canceled"; subscription?: UserSubscription };

export async function checkVendorSubscription(userId: string): Promise<SubscriptionGuardResult> {
  const sub = await adminRepo.getUserSubscriptionByUserId(userId);
  if (!sub) return { ok: false, reason: "no_subscription" };
  const now = new Date().toISOString();
  if (sub.status === "canceled") return { ok: false, reason: "canceled", subscription: sub };
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).toISOString() < now && sub.status === "active") {
    return { ok: false, reason: "expired", subscription: sub };
  }
  if (sub.status === "unpaid") return { ok: false, reason: "unpaid", subscription: sub };
  if (sub.status === "past_due") return { ok: false, reason: "past_due", subscription: sub };
  if (sub.status === "active" || sub.status === "trialing") return { ok: true, subscription: sub };
  return { ok: false, reason: "canceled", subscription: sub };
}

export async function requireActiveVendorSubscription(userId: string): Promise<UserSubscription> {
  const result = await checkVendorSubscription(userId);
  if (!result.ok) {
    throw new Error(`Abonnement requis: ${result.reason}`);
  }
  return result.subscription;
}

export async function isVendorSubscriptionActive(userId: string): Promise<boolean> {
  const result = await checkVendorSubscription(userId);
  return result.ok;
}

export async function filterActiveVendors(vendors: VendorProfile[]): Promise<VendorProfile[]> {
  const results = await Promise.all(
    vendors.map(async (vendor) => ({
      vendor,
      active: await isVendorSubscriptionActive(vendor.userId),
    }))
  );
  return results.filter((r) => r.active).map((r) => r.vendor);
}
