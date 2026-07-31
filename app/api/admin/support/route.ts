import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

export async function GET() {
  try {
    await requireAdmin();
    const tickets = await adminRepo.listTickets(100);
    return NextResponse.json({ tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const { id, ...data } = await req.json();
    await adminRepo.updateTicket(id, data);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
