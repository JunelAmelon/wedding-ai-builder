import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Le modèle de crédits n'est plus actif. La plateforme utilise désormais un modèle d'abonnements." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Le modèle de crédits n'est plus actif. La plateforme utilise désormais un modèle d'abonnements." },
    { status: 410 }
  );
}
