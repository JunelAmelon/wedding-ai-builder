import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { buildVendorProjectSummary } from "@/lib/matching/summary";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const matches = await matchRepo.listByVendor(profile.id);
    const activeMatches = matches.filter((m) => m.status !== "rejected");
    const opportunities = await Promise.all(
      activeMatches.map(async (m) => {
        const project = await projectRepo.get(m.projectId);
        let summary = null;
        if (project) {
          const session = project.sessionId ? await sessionRepo.get(project.sessionId) : null;
          summary = await buildVendorProjectSummary(project, session?.aiOutput ?? null, m.category);
        }
        return { match: m, project, summary, profile };
      })
    );

    return NextResponse.json({ opportunities: opportunities.filter((o) => o.project) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
