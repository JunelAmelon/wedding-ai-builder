import { NextRequest, NextResponse } from "next/server";
import { wishlistRepo, wishlistItemRepo, wishlistPurchaseRepo } from "@/lib/db/repositories/wishlistRepo";

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

    const [items, purchases] = await Promise.all([
      wishlistItemRepo.getByWishlist(wishlist.id),
      wishlistPurchaseRepo.getByWishlist(wishlist.id),
    ]);

    return NextResponse.json({ wishlist, items, purchases });
  } catch (error) {
    console.error("Error fetching public wishlist:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
