import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";
import type { WishlistItem } from "@/types/marketplace";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { wishlistId, name, description, price, imageUrl, vendorId, vendorName, quantity = 1 } = body;

    const numPrice = Number(price);
    const numQuantity = Number(quantity ?? 1);

    if (!wishlistId || !name || price === undefined || price === null || Number.isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: "wishlistId, name et un prix valide (non-négatif) sont requis" }, { status: 400 });
    }

    if (Number.isNaN(numQuantity) || numQuantity < 1) {
      return NextResponse.json({ error: "La quantité doit être d'au moins 1" }, { status: 400 });
    }

    const item = await wishlistItemRepo.create({
      wishlistId,
      name,
      description,
      price: numPrice,
      imageUrl,
      vendorId,
      vendorName,
      purchased: false,
      quantity: numQuantity,
      remaining: numQuantity,
    });

    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Error creating wishlist item:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get("wishlistId");

    if (!wishlistId) {
      return NextResponse.json({ error: "wishlistId requis" }, { status: 400 });
    }

    const items = await wishlistItemRepo.getByWishlist(wishlistId);
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Error fetching wishlist items:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
