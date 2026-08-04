import { wishlistPurchaseRepo, wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";
import type Stripe from "stripe";

export async function recordWishlistPayment(session: Stripe.Checkout.Session) {
  const wishlistId = session.metadata?.wishlistId;
  if (!wishlistId || session.payment_status !== "paid") {
    return null;
  }

  const existing = await wishlistPurchaseRepo.getByStripeSessionId(session.id);
  if (existing) return existing;

  const itemId = session.metadata?.itemId || undefined;
  const amount = (session.amount_total ?? 0) / 100;

  if (itemId) {
    const item = await wishlistItemRepo.get(itemId);
    if (item && item.remaining > 0) {
      const remaining = Math.max(0, item.remaining - 1);
      await wishlistItemRepo.update(item.id, {
        purchased: remaining === 0,
        purchasedBy: session.metadata?.guestEmail,
        purchasedAt: new Date().toISOString(),
        remaining,
      });
    }
  }

  return wishlistPurchaseRepo.create({
    wishlistId,
    itemId: itemId || undefined,
    itemName: session.metadata?.itemName || undefined,
    guestName: session.metadata?.guestName || "Anonyme",
    guestEmail: session.metadata?.guestEmail || "",
    amount,
    message: session.metadata?.message || undefined,
    stripeSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
  });
}
