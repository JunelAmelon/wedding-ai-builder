import { NextRequest, NextResponse } from "next/server";
import { wishlistRepo, wishlistItemRepo, wishlistPurchaseRepo } from "@/lib/db/repositories/wishlistRepo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wishlistId, itemId, guestName, guestEmail, amount, message } = body;

    if (!wishlistId || !guestName || !guestEmail || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const wishlist = await wishlistRepo.get(wishlistId);
    if (!wishlist) {
      return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });
    }

    // Si un cadeau précis est visé, on vérifie qu'il existe et qu'il reste du stock
    let item = null;
    if (itemId) {
      item = await wishlistItemRepo.get(itemId);
      if (!item) {
        return NextResponse.json({ error: "Cadeau introuvable" }, { status: 404 });
      }
      if (item.remaining <= 0) {
        return NextResponse.json({ error: "Ce cadeau n'est plus disponible" }, { status: 400 });
      }
    }

    // Créer la contribution
    const purchase = await wishlistPurchaseRepo.create({
      wishlistId,
      itemId: itemId || undefined,
      itemName: item?.name,
      guestName,
      guestEmail,
      amount: Number(amount),
      message: message || undefined,
    });

    // Mettre à jour l'item (décrémenter le stock) si un cadeau précis a été choisi
    if (item) {
      const remaining = Math.max(0, item.remaining - 1);
      await wishlistItemRepo.update(item.id, {
        purchased: remaining === 0,
        purchasedBy: guestEmail,
        purchasedAt: new Date().toISOString(),
        remaining,
      });
    }

    return NextResponse.json({ purchase });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json({ error: "Erreur lors de la contribution" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get("wishlistId");

    if (!wishlistId) {
      return NextResponse.json({ error: "wishlistId requis" }, { status: 400 });
    }

    const purchases = await wishlistPurchaseRepo.getByWishlist(wishlistId);
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
