import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { buildVendorProjectSummary } from "@/lib/matching/summary";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const { id } = await params;
    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const match = await matchRepo.get(id);
    if (!match || match.vendorId !== profile.id) {
      return NextResponse.json({ error: "Opportunité introuvable" }, { status: 404 });
    }

    const project = await projectRepo.get(match.projectId);
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const session = project.sessionId ? await sessionRepo.get(project.sessionId) : null;
    const summary = await buildVendorProjectSummary(project, session?.aiOutput ?? null, match.category, true);

    return NextResponse.json({ match, project, summary, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
