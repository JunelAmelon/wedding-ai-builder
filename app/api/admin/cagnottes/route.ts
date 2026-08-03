import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { wishlistRepo, wishlistPurchaseRepo, wishlistPayoutRepo } from "@/lib/db/repositories/wishlistRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import type { Wishlist } from "@/types/marketplace";

interface CagnotteListItem {
  wishlist: Wishlist;
  couple: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
  totalPurchased: number;
  totalPayouts: number;
  remaining: number;
}

export async function GET() {
  try {
    await requireAdmin();

    const wishlists = await wishlistRepo.listAll();
    const items: CagnotteListItem[] = [];

    for (const wishlist of wishlists) {
      const [purchases, payouts, couple] = await Promise.all([
        wishlistPurchaseRepo.getByWishlist(wishlist.id),
        wishlistPayoutRepo.getByWishlist(wishlist.id),
        userRepo.get(wishlist.coupleId),
      ]);

      const totalPurchased = purchases.reduce((sum, p) => sum + p.amount, 0);
      const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
      const remaining = totalPurchased - totalPayouts;

      items.push({
        wishlist,
        couple: couple
          ? {
              id: couple.id,
              firstName: couple.firstName,
              lastName: couple.lastName,
              email: couple.email,
              phone: couple.phone,
            }
          : null,
        totalPurchased,
        totalPayouts,
        remaining,
      });
    }

    return NextResponse.json({ cagnottes: items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
