import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { createVerificationChallenge } from "@/lib/services/googleBusinessService";

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

    if (!placeId) {
      return NextResponse.json({ error: "Identifiant d'établissement manquant" }, { status: 400 });
    }

    const challenge = await createVerificationChallenge({
      vendorId: profile.id,
      placeId,
      vendorWebsite: profile.website || profile.portfolio?.website,
      vendorEmail: profile.email,
      vendorCompanyName: profile.companyName,
    });

    return NextResponse.json({ challenge });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
