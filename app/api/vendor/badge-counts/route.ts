import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { messageRepo } from "@/lib/db/repositories/messageRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux prestataires" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id).catch(() => null);
    if (!profile) {
      return NextResponse.json({ unreadMessages: 0, newOpportunities: 0, unreadNotifications: 0 });
    }

    const [matches, proposals, unreadNotifs] = await Promise.all([
      matchRepo.listByVendor(profile.id).catch(() => []),
      proposalRepo.listByVendor(profile.id).catch(() => []),
      notificationRepo.listUnreadByUser(user.id).catch(() => []),
    ]);

    // Fetch related tenders to verify if they are closed or already validated
    const tenderIds = Array.from(
      new Set(matches.map((m: any) => m.tenderId).filter(Boolean))
    );
    const tenders = await Promise.all(
      tenderIds.map((id: string) => tenderRepo.get(id).catch(() => null))
    );
    const tenderMap = new Map(tenders.filter(Boolean).map((t: any) => [t.id, t]));

    const respondedTenderIds = new Set(proposals.map((p: any) => p.tenderId).filter(Boolean));
    const respondedMatchIds = new Set(proposals.map((p: any) => p.matchId).filter(Boolean));
    const respondedProjects = new Set(
      proposals.map((p: any) => `${p.projectId}_${p.category || ""}`)
    );

    // Une opportunité ne doit afficher une pastille QUE si elle est active,
    // non clôturée, non déjà validée par le couple et non déjà répondue par le prestataire
    const newOpportunities = matches.filter((m: any) => {
      if (m.status !== "suggested") return false;
      if (respondedMatchIds.has(m.id)) return false;
      if (m.tenderId && respondedTenderIds.has(m.tenderId)) return false;
      if (respondedProjects.has(`${m.projectId}_${m.category}`)) return false;

      if (m.tenderId && tenderMap.has(m.tenderId)) {
        const tender = tenderMap.get(m.tenderId);
        // Si l'appel d'offre a été clôturé ou validé (prestataire retenu), pas de pastille
        if (tender.status === "closed" || Boolean(tender.selectedProposalId)) return false;
      }

      return true;
    }).length;

    const unreadMessageCounts = await Promise.all(
      proposals.map(async (p: any) => {
        try {
          const messages = await messageRepo.listByProposal(p.id);
          return messages.filter((m: any) => m.senderRole !== "vendor" && !m.readAt).length;
        } catch {
          return 0;
        }
      })
    );

    const unreadMessages = unreadMessageCounts.reduce((acc, count) => acc + count, 0);

    return NextResponse.json({
      unreadMessages,
      newOpportunities,
      unreadNotifications: unreadNotifs.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ unreadMessages: 0, newOpportunities: 0, unreadNotifications: 0 }, { status: 200 });
  }
}
