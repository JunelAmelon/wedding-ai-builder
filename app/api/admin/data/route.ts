import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { leadRepo } from "@/lib/db/repositories/leadRepo";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";

export async function GET() {
  try {
    await requireAdmin();
    const [leads, vendorApplications] = await Promise.all([leadRepo.list(), vendorRepo.list()]);
    return NextResponse.json({ leads, vendorApplications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
