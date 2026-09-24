import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

export async function GET() {
  try {
    await requireAdmin();

    const [applications, tickets] = await Promise.all([
      vendorRepo.list().catch(() => []),
      adminRepo.listTickets(100).catch(() => []),
    ]);

    const pendingCandidatures = applications.filter((a: any) => a.status === "pending").length;
    const openTickets = tickets.filter((t: any) => t.status === "open").length;

    return NextResponse.json({
      pendingCandidatures,
      openTickets,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ pendingCandidatures: 0, openTickets: 0 }, { status: 200 });
  }
}
