import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { wishlistRepo, wishlistPurchaseRepo } from "@/lib/db/repositories/wishlistRepo";

/**
 * Les contributions directes non vérifiées par Stripe sont interdites.
 * Les paiements passent obligatoirement par /api/wishlist/checkout et sont enregistrés
 * de manière certifiée par le webhook Stripe ou la session Stripe.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Les contributions doivent être effectuées via le flux de paiement sécurisé Stripe." },
    { status: 405 }
  );
}

/**
 * Récupération sécurisée des contributions de la wishlist.
 * Seul le couple propriétaire (ou un administrateur) peut consulter les contributions.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple" && user.role !== "admin") {
      return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const wishlistId = searchParams.get("wishlistId");

    if (!wishlistId) {
      return NextResponse.json({ error: "wishlistId requis" }, { status: 400 });
    }

    const wishlist = await wishlistRepo.get(wishlistId);
    if (!wishlist) {
      return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });
    }

    // Protection IDOR : seul le propriétaire de la liste de mariage peut voir les contributions
    if (wishlist.coupleId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const purchases = await wishlistPurchaseRepo.getByWishlist(wishlistId);
    return NextResponse.json({ purchases });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
