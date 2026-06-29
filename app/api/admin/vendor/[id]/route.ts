import { NextResponse } from "next/server";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import type { VendorApplication } from "@/types/domain";

function checkPassword(req: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${password}`;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, notes } = body as { status: VendorApplication["status"]; notes: string | null };
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const updated = await vendorRepo.updateStatus(params.id, status, notes ?? null, "admin");
    return NextResponse.json({ application: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
