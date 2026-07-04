import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { creditRepo } from "@/lib/db/repositories/creditRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profil professionnel introuvable" }, { status: 404 });
    }

    const matches = await matchRepo.listByVendor(profile.id);
    const newOpportunities = matches.filter((m) => m.status === "suggested").length;

    const proposals = await proposalRepo.listByVendor(profile.id);
    const sentProposals = proposals.length;
    const wonContracts = proposals.filter((p) => p.status === "accepted").length;
    const pendingProposals = proposals.filter((p) => p.status === "pending").length;
    const declinedProposals = proposals.filter((p) => p.status === "declined").length;
    const archivedProposals = proposals.filter((p) => p.status === "archived").length;
    const activeProposals = proposals.filter((p) => p.status === "pending" || p.status === "accepted").length;
    const responseRate = sentProposals > 0 ? Math.round((wonContracts / sentProposals) * 100) : 0;
    const averageCompatibility = sentProposals > 0
      ? Math.round(matches.filter((m) => proposals.some((p) => p.matchId === m.id)).reduce((acc, m) => acc + m.score, 0) / sentProposals)
      : 0;

    const unreadNotifications = await notificationRepo.listUnreadByUser(user.id);
    const creditTransactions = await creditRepo.listByVendor(profile.id);

    return NextResponse.json({
      stats: {
        credits: profile.credits,
        newOpportunities,
        sentProposals,
        activeProposals,
        pendingProposals,
        declinedProposals,
        archivedProposals,
        responseRate,
        averageCompatibility,
        wonContracts,
        profileCompletion: profile.profileCompletion,
        verified: profile.verified,
      },
      matches: matches.slice(0, 10),
      proposals: proposals.slice(0, 10),
      notifications: unreadNotifications,
      creditTransactions: creditTransactions.slice(0, 10),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
