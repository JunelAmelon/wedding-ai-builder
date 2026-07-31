import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const [user, profile, applications] = await Promise.all([
      userRepo.get(params.id),
      vendorProfileRepo.getByUserId(params.id).catch(() => null),
      vendorRepo.list().then(list => list.find(a => a.userId === params.id) || null),
    ]);
    if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ user, profile, application: applications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
