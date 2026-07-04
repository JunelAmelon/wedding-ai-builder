import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ recommendations: [] });

    const matches = await matchRepo.listByProject(project.id);
    const recommendations = await Promise.all(
      matches.map(async (m) => {
        const vendor = await vendorProfileRepo.get(m.vendorId);
        return { match: m, vendor };
      })
    );

    return NextResponse.json({ recommendations: recommendations.filter((r) => r.vendor) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
