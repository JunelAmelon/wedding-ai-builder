import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { messageRepo } from "@/lib/db/repositories/messageRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { tenderRepo } from "@/lib/db/repositories/tenderRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") {
      return NextResponse.json({ error: "Accès réservé aux couples" }, { status: 403 });
    }

    const projects = await projectRepo.listByUser(user.id).catch(() => []);
    const project = projects[0];
    if (!project) {
      return NextResponse.json({ unreadMessages: 0, pendingProposals: 0, unreadNotifications: 0 });
    }

    const [proposals, tenders, unreadNotifs] = await Promise.all([
      proposalRepo.listByProject(project.id).catch(() => []),
      tenderRepo.listByProject(project.id).catch(() => []),
      notificationRepo.listUnreadByUser(user.id).catch(() => []),
    ]);

    // Appels d'offres clôturés ou ayant un prestataire validé / retenu
    const closedOrValidatedTenderIds = new Set(
      tenders
        .filter((t: any) => t.status === "closed" || Boolean(t.selectedProposalId))
        .map((t: any) => t.id)
    );

    const acceptedTenderIds = new Set(
      proposals.filter((p: any) => p.status === "accepted").map((p: any) => p.tenderId).filter(Boolean)
    );

    // Une candidature ne doit afficher un badge QUE si elle est en attente
    // ET que l'appel d'offre n'a pas déjà été clôturé ou validé
    const pendingProposals = proposals.filter((p: any) => {
      if (p.status !== "pending") return false;
      if (p.tenderId && (closedOrValidatedTenderIds.has(p.tenderId) || acceptedTenderIds.has(p.tenderId))) {
        return false;
      }
      return true;
    }).length;

    const unreadMessageCounts = await Promise.all(
      proposals.map(async (p: any) => {
        try {
          const messages = await messageRepo.listByProposal(p.id);
          return messages.filter((m: any) => m.senderRole !== "couple" && !m.readAt).length;
        } catch {
          return 0;
        }
      })
    );

    const unreadMessages = unreadMessageCounts.reduce((acc, count) => acc + count, 0);

    return NextResponse.json({
      unreadMessages,
      pendingProposals,
      unreadNotifications: unreadNotifs.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ unreadMessages: 0, pendingProposals: 0, unreadNotifications: 0 }, { status: 200 });
  }
}
