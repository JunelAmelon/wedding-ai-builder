import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const [user, profile, projects] = await Promise.all([
      userRepo.get(params.id),
      coupleProfileRepo.getByUserId(params.id).catch(() => null),
      projectRepo.listByUser(params.id).catch(() => []),
    ]);
    if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ user, profile, projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
