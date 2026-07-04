import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const vendors = await vendorProfileRepo.listApproved();
    return NextResponse.json({ vendors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
