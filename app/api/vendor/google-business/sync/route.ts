import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { syncGoogleBusinessReviews } from "@/lib/services/googleBusinessService";
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

    const currentGoogle = profile.portfolio?.googleBusiness;
    if (!currentGoogle || !currentGoogle.verified) {
      return NextResponse.json({ error: "Aucune fiche Google certifiée à synchroniser" }, { status: 400 });
    }

    const updatedGoogle = await syncGoogleBusinessReviews(currentGoogle);

    const updatedPortfolio = {
      ...profile.portfolio,
      googleBusiness: updatedGoogle,
    };

    const updated = await vendorProfileRepo.update(profile.id, {
      portfolio: updatedPortfolio,
    });

    revalidateVendorMatches(updated).catch(() => {});

    return NextResponse.json({
      success: true,
      googleBusiness: updatedGoogle,
      profile: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
