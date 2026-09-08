import { NextRequest, NextResponse } from "next/server";

/**
 * Géocode un nom de ville française en coordonnées [lat, lon] via l'API Géo.
 * - GET /api/geo/geocode?city=Bordeaux
 * Retourne : { lat, lon } ou 404 si non trouvé.
 *
 * Utilisé par la carte admin pour placer les points des villes des utilisateurs.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get("city") || "").trim();

  if (!city) {
    return NextResponse.json({ error: "Paramètre 'city' requis" }, { status: 400 });
  }

  try {
    const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(city)}&boost=population&fields=centre&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 502 });
    }

    const data = (await res.json()) as Array<{
      centre?: { coordinates: [number, number] };
    }>;

    if (!data.length || !data[0].centre) {
      return NextResponse.json({ error: "Ville non trouvée" }, { status: 404 });
    }

    const [lon, lat] = data[0].centre.coordinates;
    return NextResponse.json({ lat, lon });
  } catch (err) {
    console.error("[geo/geocode] error:", err);
    return NextResponse.json({ error: "Erreur de géocodage" }, { status: 500 });
  }
}
