import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { leadRepo } from "@/lib/db/repositories/leadRepo";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = await checkRateLimit(`admin-data:${ip}`, 60, 60);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
    }
    await requireAdmin();
    const [leads, vendorApplications] = await Promise.all([leadRepo.list(), vendorRepo.list()]);
    return NextResponse.json({ leads, vendorApplications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
