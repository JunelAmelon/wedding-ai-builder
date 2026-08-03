import { NextRequest, NextResponse } from "next/server";
import { wishlistRepo, wishlistItemRepo, wishlistPurchaseRepo } from "@/lib/db/repositories/wishlistRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareToken = searchParams.get("token");

    if (!shareToken) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    const wishlist = await wishlistRepo.getByShareToken(shareToken);
    if (!wishlist) {
      return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });
    }

    const [items, purchases, couple] = await Promise.all([
      wishlistItemRepo.getByWishlist(wishlist.id),
      wishlistPurchaseRepo.getByWishlist(wishlist.id),
      userRepo.get(wishlist.coupleId),
    ]);

    const couplePublic = couple
      ? { firstName: couple.firstName, lastName: couple.lastName, avatarUrl: couple.avatarUrl }
      : null;

    return NextResponse.json({ wishlist, items, purchases, couple: couplePublic });
  } catch (error) {
    console.error("Error fetching public wishlist:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
