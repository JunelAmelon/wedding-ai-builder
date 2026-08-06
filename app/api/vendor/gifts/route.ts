import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ items: [] });
    }

    const allItems = await wishlistItemRepo.getByWishlist("all");
    const vendorItems = allItems.filter((item) => item.vendorId === profile.id);

    return NextResponse.json({ items: vendorItems });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Error fetching vendor gifts:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
