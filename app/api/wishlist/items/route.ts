import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";
import type { WishlistItem } from "@/types/marketplace";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const token = cookieStore.get("wab_session")?.value;
    const user = token ? verifySession(token) : null;

    if (!user || user.role !== "couple") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { wishlistId, name, description, price, imageUrl, vendorId, vendorName, quantity = 1 } = body;

    if (!wishlistId || !name || !price) {
      return NextResponse.json({ error: "wishlistId, name et price requis" }, { status: 400 });
    }

    const item = await wishlistItemRepo.create({
      wishlistId,
      name,
      description,
      price,
      imageUrl,
      vendorId,
      vendorName,
      purchased: false,
      quantity,
      remaining: quantity,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get("wishlistId");

    if (!wishlistId) {
      return NextResponse.json({ error: "wishlistId requis" }, { status: 400 });
    }

    const items = await wishlistItemRepo.getByWishlist(wishlistId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
