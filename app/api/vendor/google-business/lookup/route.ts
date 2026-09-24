import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { lookupGooglePlace } from "@/lib/services/googleBusinessService";

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
    const query = String(body.query || profile.companyName || "").trim();

    if (!query) {
      return NextResponse.json({ error: "Veuillez renseigner un nom ou un lien d'établissement" }, { status: 400 });
    }

    const place = await lookupGooglePlace(query, {
      companyName: profile.companyName,
      website: profile.website || profile.portfolio?.website,
      email: profile.email,
      city: profile.address?.city,
    });

    if (!place) {
      return NextResponse.json({ error: "Aucun établissement trouvé sur Google" }, { status: 404 });
    }

    return NextResponse.json({ place });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
