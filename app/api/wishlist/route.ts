import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { wishlistRepo, wishlistItemRepo, wishlistPurchaseRepo } from "@/lib/db/repositories/wishlistRepo";
import type { Wishlist, WishlistItem } from "@/types/marketplace";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, weddingId, isPublic = true } = body;

    if (!title || !weddingId) {
      return NextResponse.json({ error: "Titre et weddingId requis" }, { status: 400 });
    }

    const wishlist = await wishlistRepo.create({
      coupleId: user.id,
      weddingId,
      title,
      description,
      isPublic,
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Error creating wishlist:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const wishlists = await wishlistRepo.getByCouple(user.id);
    return NextResponse.json({ wishlists });
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
