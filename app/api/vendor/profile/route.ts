import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { revalidateVendorMatches } from "@/lib/matching/engine";
import { geocodeCity, geocodeAddress } from "@/lib/geocoding/nominatim";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json();

    // Geocode vendor address and service area on update so matching can use real GPS distance
    const updates: Record<string, unknown> = { ...body };
    if (body.address && body.address.street && body.address.city && body.address.zipCode) {
      const geo = await geocodeAddress(body.address.street, body.address.city, body.address.zipCode, body.address.country || "France");
      if (geo) {
        updates.address = { ...body.address, geo };
      }
    }
    if (body.serviceArea?.cities?.length > 0) {
      const city = body.serviceArea.cities[0];
      const country = body.address?.country || "France";
      const geo = await geocodeCity(city, country);
      if (geo) {
        updates.serviceArea = { ...body.serviceArea, geo };
      }
    }

    const updated = await vendorProfileRepo.update(profile.id, updates);
    revalidateVendorMatches(updated).catch(() => {});
    return NextResponse.json({ profile: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
