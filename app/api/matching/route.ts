import { NextResponse } from "next/server";
import { z } from "zod";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { findTopMatches } from "@/lib/matching/engine";
import { requireAuth } from "@/lib/auth";

const MatchSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Accès réservé aux couples" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = MatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { projectId, category } = parsed.data;
    const project = await projectRepo.get(projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

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

    const vendors = await vendorProfileRepo.listApproved();
    const topMatches = await findTopMatches(tenderData, project, vendors, category, 3);

    await matchRepo.deleteByProject(projectId);

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

    return NextResponse.json({ matches: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du matching";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
