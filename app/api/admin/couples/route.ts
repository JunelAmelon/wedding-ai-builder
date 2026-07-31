import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

export async function GET() {
  try {
    await requireAdmin();
    const couples = await adminRepo.listCouples();
    return NextResponse.json({ couples });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
