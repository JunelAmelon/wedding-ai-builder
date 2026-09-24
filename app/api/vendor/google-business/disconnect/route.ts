import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { revalidateVendorMatches } from "@/lib/matching/engine";

export async function POST() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux prestataires" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const updatedPortfolio = {
      ...profile.portfolio,
      googleBusiness: null,
    };

    const updated = await vendorProfileRepo.update(profile.id, {
      portfolio: updatedPortfolio,
    });

    revalidateVendorMatches(updated).catch(() => {});

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
