import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const token = cookieStore.get("wab_session")?.value;
    const user = token ? verifySession(token) : null;

    if (!user || user.role !== "vendor") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Pour l'instant, retourner tous les items (à filtrer par vendorId plus tard)
    const allItems = await wishlistItemRepo.getByWishlist("all");
    // Filtrer par vendorId du prestataire connecté
    const vendorItems = allItems.filter((item) => item.vendorId === user.id);
    
    return NextResponse.json({ items: vendorItems });
  } catch (error) {
    console.error("Error fetching vendor gifts:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
