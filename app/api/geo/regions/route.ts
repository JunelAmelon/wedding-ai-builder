import { NextResponse } from "next/server";

/**
 * Liste des régions françaises (métropole + DROM).
 * Servie en statique car la liste est fixe et petite (18 régions).
 * Utilisée par le composant RegionAutocomplete.
 */
const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
];

export async function GET() {
  return NextResponse.json({ regions: REGIONS });
}
