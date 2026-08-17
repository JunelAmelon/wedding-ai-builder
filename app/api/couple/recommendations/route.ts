import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { findTopMatches } from "@/lib/matching/engine";
import { filterActiveVendors } from "@/lib/subscription-guard";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ recommendations: [] });

    let matches = await matchRepo.listByProject(project.id);

    if (matches.length === 0) {
      const tenderData = {
        budgetRange: project.budget ? { min: project.budget.amount * 0.8, max: project.budget.amount * 1.2, currency: project.budget.currency } : null,
        guestCount: project.guestCount,
        location: project.location,
        weddingDate: project.weddingDate,
        style: project.style,
        customStyle: project.customStyle,
        requirements: [],
        priority: null,
      };
      const allVendors = await vendorProfileRepo.listApproved();
      const activeVendors = await filterActiveVendors(allVendors);
      const categories = [...new Set(activeVendors.map((v) => v.serviceCategory))];
      for (const category of categories) {
        const topMatches = await findTopMatches(tenderData, project, activeVendors, category, 2);
        const saved = await Promise.all(
          topMatches.map((m) =>
            matchRepo.create({
              projectId: m.projectId,
              tenderId: m.tenderId,
              vendorId: m.vendorId,
              category: m.category,
              score: m.score,
              reasons: m.reasons,
              summary: m.summary,
              status: "suggested",
            })
          )
        );
        matches = matches.concat(saved);
      }
    }

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
