import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const profile = await coupleProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const ids = profile.favoriteVendorIds || [];
    const vendors = await Promise.all(ids.map((id) => vendorProfileRepo.get(id)));
    return NextResponse.json({ ids, vendors: vendors.filter(Boolean) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const { vendorId } = await req.json();
    if (!vendorId || typeof vendorId !== "string") {
      return NextResponse.json({ error: "vendorId requis" }, { status: 400 });
    }

    const profile = await coupleProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const current = profile.favoriteVendorIds || [];
    const isFavorite = current.includes(vendorId);
    const favoriteVendorIds = isFavorite ? current.filter((id) => id !== vendorId) : [...current, vendorId];

    await coupleProfileRepo.update(profile.id, { favoriteVendorIds });
    return NextResponse.json({ favoriteVendorIds, isFavorite: !isFavorite });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
