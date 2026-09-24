import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { confirmVerificationChallenge } from "@/lib/services/googleBusinessService";
import { revalidateVendorMatches } from "@/lib/matching/engine";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux prestataires" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const placeId = String(body.placeId || "").trim();
    const code = String(body.code || "").trim();

    if (!placeId || !code) {
      return NextResponse.json({ error: "Identifiant d'établissement et code de vérification requis" }, { status: 400 });
    }

    const googleBusiness = await confirmVerificationChallenge(profile.id, placeId, code);

    // Mise à jour du profil prestataire avec les données certifiées
    const updatedPortfolio = {
      ...(profile.portfolio || {
        images: [],
        website: null,
        instagram: null,
        videos: [],
        faq: [],
        reviews: [],
      }),
      googleBusiness,
    };

    const updated = await vendorProfileRepo.update(profile.id, {
      portfolio: updatedPortfolio,
    });

    // Déclenche la revalidation des scores de matching
    revalidateVendorMatches(updated).catch(() => {});

    return NextResponse.json({
      success: true,
      googleBusiness,
      profile: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
