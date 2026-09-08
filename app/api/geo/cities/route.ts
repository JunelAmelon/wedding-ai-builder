import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy vers l'API Géo (api.gouv.fr/geo) pour l'autocomplétion des communes françaises.
 * - GET /api/geo/cities?q=bordeaux&limit=10
 * Retourne : [{ nom, code, codeDepartement, codeRegion, nomRegion, codesPostaux, centre: { lat, lon } }]
 *
 * On passe par un proxy serveur pour :
 *  - éviter les problèmes CORS côté navigateur
 *  - mettre en cache les résultats (réduit la charge sur l'API publique)
 *  - normaliser la réponse en un format simple pour le front
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  if (q.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    // L'API Géo propose /communes?nom=... qui supporte la recherche floue
    const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&boost=population&fields=code,codeDepartement,codeRegion,nomRegion,codesPostaux,centre&format=json&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Cache côté serveur 24h pour les mêmes requêtes
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 502 });
    }

    const raw = (await res.json()) as Array<{
      nom: string;
      code: string;
      codeDepartement?: string;
      codeRegion?: string;
      nomRegion?: string;
      codesPostaux?: string[];
      centre?: { coordinates: [number, number] }; // [lon, lat] en GeoJSON
    }>;

    const cities = raw.map((c) => ({
      nom: c.nom,
      code: c.code,
      codeDepartement: c.codeDepartement ?? null,
      codeRegion: c.codeRegion ?? null,
      nomRegion: c.nomRegion ?? null,
      codesPostaux: c.codesPostaux ?? [],
      lat: c.centre?.coordinates?.[1] ?? null,
      lon: c.centre?.coordinates?.[0] ?? null,
    }));

    return NextResponse.json({ cities });
  } catch (err) {
    console.error("[geo/cities] error:", err);
    return NextResponse.json({ error: "Erreur de géocodage" }, { status: 500 });
  }
}
