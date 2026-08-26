import { NextResponse } from "next/server";
import { z } from "zod";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { runAutoMatching } from "@/lib/matching/auto-match";
import { requireAuth } from "@/lib/auth";

const MatchSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().min(1),
  all: z.boolean().optional().default(false),
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

    const { projectId, all } = parsed.data;
    const project = await projectRepo.get(projectId);
    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    if (all) {
      await matchRepo.deleteByProject(projectId);
    } else {
      await matchRepo.deleteByProjectAndCategory(projectId, parsed.data.category);
    }

    const result = await runAutoMatching(project, { perCategory: all ? 2 : 3, notifyVendors: true });

    return NextResponse.json({ matches: result.matches });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors du matching";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
