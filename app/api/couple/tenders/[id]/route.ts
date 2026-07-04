import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const { id } = await params;
    const tender = await tenderRepo.get(id);
    if (!tender) return NextResponse.json({ error: "Appel d'offres introuvable" }, { status: 404 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects.find((p) => p.id === tender.projectId);
    if (!project) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const matches = await matchRepo.listByProject(tender.projectId);
    const tenderMatches = matches.filter((m) => m.tenderId === tender.id || tender.matchIds.includes(m.id));

    const proposals = await proposalRepo.listByTender(tender.id);
    const enrichedProposals = await Promise.all(
      proposals.map(async (p) => {
        const vendor = await vendorProfileRepo.get(p.vendorId);
        return { ...p, vendor };
      })
    );

    return NextResponse.json({ tender: { ...tender, matches: tenderMatches, proposals: enrichedProposals } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
