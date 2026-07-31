import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";

export async function GET() {
  try {
    await requireAdmin("moderator");
    const applications = await vendorRepo.list();
    return NextResponse.json({ applications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
