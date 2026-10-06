import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { wishlistItemRepo, wishlistRepo } from "@/lib/db/repositories/wishlistRepo";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    if (user.role !== "couple" && user.role !== "admin") {
      return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    }

    const item = await wishlistItemRepo.get(params.id);
    if (!item) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    const wishlist = await wishlistRepo.get(item.wishlistId);
    if (!wishlist) {
      return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });
    }

    // Protection contre l'IDOR : vérifier que la liste appartient bien à l'utilisateur connecté
    if (wishlist.coupleId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cet article" },
        { status: 403 }
      );
    }

    await wishlistItemRepo.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Error deleting wishlist item:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
