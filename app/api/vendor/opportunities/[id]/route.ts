import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isVendorSubscriptionActive } from "@/lib/subscription-guard";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";
import { buildVendorProjectSummary } from "@/lib/matching/summary";
import { scoreMatchesWithAI } from "@/lib/matching/engine";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const subscriptionActive = await isVendorSubscriptionActive(user.id).catch(() => false);

    const { id } = await params;
    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const match = await matchRepo.get(id);
    if (!match || match.vendorId !== profile.id) {
      return NextResponse.json({ error: "Opportunité introuvable" }, { status: 404 });
    }

    // Free vendors: return limited project info (name only), no sensitive details
    if (!subscriptionActive) {
      const limitedProject = await projectRepo.get(match.projectId);
      return NextResponse.json({
        match,
        project: limitedProject ? { id: limitedProject.id, name: limitedProject.name } : null,
        summary: null,
        profile,
        subscriptionActive: false,
      });
    }

    const project = await projectRepo.get(match.projectId);
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    if (subscriptionActive && !match.vendorPitch) {
      try {
        const tender = match.tenderId ? await tenderRepo.get(match.tenderId) : null;
        const aiScores = await scoreMatchesWithAI(tender ?? { category: match.category }, project, [profile], match.category);
        const ai = aiScores[profile.id];
        if (ai?.vendorPitch) {
          await matchRepo.update(match.id, { vendorPitch: ai.vendorPitch });
          match.vendorPitch = ai.vendorPitch;
        }
      } catch (e) {
        console.error("[vendor opportunity] vendorPitch backfill failed", e);
      }
    }

    const session = project.sessionId ? await sessionRepo.get(project.sessionId) : null;
    const summary = await buildVendorProjectSummary(project, session?.aiOutput ?? null, match.category, true);

    return NextResponse.json({ match, project, summary, profile, subscriptionActive: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const subscriptionActive = await isVendorSubscriptionActive(user.id).catch(() => false);
    if (!subscriptionActive) {
      return NextResponse.json({ error: "Abonnement requis" }, { status: 402 });
    }

    const project = await projectRepo.get(match.projectId);
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const currentCount = match.regenCount ?? 0;
    if (currentCount >= 2) {
      return NextResponse.json({ error: "Vous avez atteint la limite de 2 régénérations.", regenCount: currentCount }, { status: 429 });
    }

    const tender = match.tenderId ? await tenderRepo.get(match.tenderId) : null;
    const aiScores = await scoreMatchesWithAI(tender ?? { category: match.category }, project, [profile], match.category);
    const ai = aiScores[profile.id];

    const newVendorPitch = ai?.vendorPitch ?? match.vendorPitch;
    const newRegenCount = currentCount + 1;
    await matchRepo.update(match.id, { vendorPitch: newVendorPitch, regenCount: newRegenCount });
    return NextResponse.json({ vendorPitch: newVendorPitch, regenCount: newRegenCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
