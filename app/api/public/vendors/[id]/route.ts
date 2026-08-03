import { NextResponse } from "next/server";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vendor = await vendorProfileRepo.get(id);
    if (!vendor) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    return NextResponse.json({ vendor });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
