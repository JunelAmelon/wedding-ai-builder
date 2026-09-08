import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy vers l'API Adresse (api-adresse.data.gouv.fr) pour la recherche d'adresses complètes.
 * - GET /api/geo/address?q=12+rue+de+la+paix+paris&limit=5
 * Retourne : [{ label, name, postcode, citycode, city, context, lat, lon }]
 *
 * Utile pour le champ "adresse complète" du gate d'inscription client :
 *  - recherche rue + CP + ville en une seule frappe
 *  - retourne des coordonnées GPS précises (utile pour la carte admin)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit")) || 5, 10);

  if (q.length < 3) {
    return NextResponse.json({ addresses: [] });
  }

  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 502 });
    }

    const data = (await res.json()) as {
      features: Array<{
        properties: {
          label: string;
          name: string;
          postcode: string;
          citycode: string;
          city: string;
          context: string;
        };
        geometry: { coordinates: [number, number] };
      }>;
    };

    const addresses = data.features.map((f) => ({
      label: f.properties.label,
      name: f.properties.name,
      postcode: f.properties.postcode,
      citycode: f.properties.citycode,
      city: f.properties.city,
      context: f.properties.context,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
    }));

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("[geo/address] error:", err);
    return NextResponse.json({ error: "Erreur de géocodage" }, { status: 500 });
  }
}
