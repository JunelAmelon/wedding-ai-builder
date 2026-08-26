import { getCached, setCached } from "@/lib/cache/redis";

export interface GeoPoint {
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const USER_AGENT = "MariageFacile/1.0 (contact@lesnocesfaciles.fr)";

export async function geocodeCity(city: string, country = "France", limit = 1): Promise<GeoPoint | null> {
  const query = `${encodeURIComponent(city)},${encodeURIComponent(country)}`;
  const cacheKey = `geo:city:${city.toLowerCase().trim()}:${country.toLowerCase().trim()}`;

  const cached = await getCached<GeoPoint>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=${limit}&accept-language=fr`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!res.ok) {
      console.error(`[nominatim] HTTP ${res.status} for ${city}`);
      return null;
    }
    const data = (await res.json()) as NominatimResult[];
    if (!data?.length) return null;
    const point = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) return null;
    await setCached(cacheKey, point, 30 * 24 * 60 * 60); // cache 30 days
    return point;
  } catch (err) {
    console.error("[nominatim] geocode error:", err);
    return null;
  }
}

export async function geocodeAddress(street: string, city: string, zipCode: string, country = "France", limit = 1): Promise<GeoPoint | null> {
  const query = `${encodeURIComponent(street)}, ${encodeURIComponent(zipCode)} ${encodeURIComponent(city)}, ${encodeURIComponent(country)}`;
  const cacheKey = `geo:addr:${street.toLowerCase().trim()}:${city.toLowerCase().trim()}:${zipCode.toLowerCase().trim()}:${country.toLowerCase().trim()}`;

  const cached = await getCached<GeoPoint>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=${limit}&accept-language=fr`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!res.ok) {
      console.error(`[nominatim] HTTP ${res.status} for ${street}, ${city}`);
      return null;
    }
    const data = (await res.json()) as NominatimResult[];
    if (!data?.length) return null;
    const point = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) return null;
    await setCached(cacheKey, point, 30 * 24 * 60 * 60);
    return point;
  } catch (err) {
    console.error("[nominatim] geocode error:", err);
    return null;
  }
}
