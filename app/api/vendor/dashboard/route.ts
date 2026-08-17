import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";
import { creditRepo } from "@/lib/db/repositories/creditRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { getVendorPlanById, getVendorPlanByStripePriceId } from "@/lib/subscriptions";

function mapStatus(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    default:
      return "unpaid";
  }
}

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

    const matches = await matchRepo.listByVendor(profile.id).catch(() => []);
    const newOpportunities = matches.filter((m) => m.status === "suggested").length;

    const proposals = await proposalRepo.listByVendor(profile.id).catch(() => []);
    const sentProposals = proposals.length;
    const wonContracts = proposals.filter((p) => p.status === "accepted").length;
    const pendingProposals = proposals.filter((p) => p.status === "pending").length;
    const declinedProposals = proposals.filter((p) => p.status === "declined").length;
    const archivedProposals = proposals.filter((p) => p.status === "archived").length;
    const activeProposals = proposals.filter((p) => p.status === "pending" || p.status === "accepted").length;
    const responseRate = sentProposals > 0 ? Math.round((wonContracts / sentProposals) * 100) : 0;
    const matched = matches.filter((m) => proposals.some((p) => p.matchId === m.id));
    const averageCompatibility = matched.length > 0
      ? Math.round(matched.reduce((acc, m) => acc + (m.score ?? 0), 0) / matched.length)
      : 0;

    const unreadNotifications = await notificationRepo.listUnreadByUser(user.id).catch(() => []);
    const creditTransactions = await creditRepo.listByVendor(profile.id).catch(() => []);

    const enrichedMatches = await Promise.all(
      matches.map(async (m) => {
        try {
          const project = m.projectId ? await projectRepo.get(m.projectId) : null;
          return { ...m, project };
        } catch {
          return { ...m, project: null };
        }
      })
    );

    const enrichedProposals = await Promise.all(
      proposals.map(async (p) => {
        try {
          const project = p.projectId ? await projectRepo.get(p.projectId) : null;
          return { ...p, project };
        } catch {
          return { ...p, project: null };
        }
      })
    );

    const dbUser = await userRepo.get(user.id);
    if (dbUser?.stripeCustomerId) {
      try {
        const stripeSubs = await getStripe().subscriptions.list({
          customer: dbUser.stripeCustomerId,
          status: "all",
          limit: 1,
        });
        const stripeSub = stripeSubs.data[0];
        if (stripeSub) {
          const item = stripeSub.items.data[0];
          const price = item?.price;
          const plan = price?.id ? getVendorPlanByStripePriceId(price.id) : undefined;
          await userRepo.update(user.id, {
            stripeCustomerId: dbUser.stripeCustomerId,
            stripeSubscriptionId: stripeSub.id,
          });
          await adminRepo.updateUserSubscription(stripeSub.id, {
            userId: user.id,
            planId: plan?.id || null,
            status: mapStatus(stripeSub.status),
            stripeCustomerId: dbUser.stripeCustomerId,
            stripeSubscriptionId: stripeSub.id,
            currentPeriodStart: new Date((item.current_period_start ?? stripeSub.billing_cycle_anchor ?? 0) * 1000).toISOString(),
            currentPeriodEnd: new Date((item.current_period_end ?? stripeSub.billing_cycle_anchor ?? 0) * 1000).toISOString(),
            canceledAt: stripeSub.cancel_at ? new Date(stripeSub.cancel_at * 1000).toISOString() : null,
            planInterval: price?.recurring?.interval || "month",
            amount: price?.unit_amount || plan?.price || 0,
            currency: stripeSub.currency || "eur",
          });
        }
      } catch (err) {
        console.error("[dashboard] sync stripe error", err);
      }
    }

    const subscription = await adminRepo.getUserSubscriptionByUserId(user.id).catch(() => null);
    const plan = subscription?.planId ? getVendorPlanById(subscription.planId) : undefined;

    return NextResponse.json({
      stats: {
        credits: profile.credits ?? 0,
        newOpportunities,
        sentProposals,
        activeProposals,
        pendingProposals,
        declinedProposals,
        archivedProposals,
        responseRate,
        averageCompatibility,
        wonContracts,
        profileCompletion: profile.profileCompletion ?? 0,
        verified: profile.verified ?? false,
      },
      matches: enrichedMatches.slice(0, 10),
      proposals: enrichedProposals.slice(0, 10),
      notifications: unreadNotifications,
      creditTransactions: creditTransactions.slice(0, 10),
      subscription: subscription
        ? {
            ...subscription,
            planName: plan?.name || subscription.planId || "Abonnement",
            features: plan?.features || [],
          }
        : null,
    });
  } catch (err) {
    console.error("[dashboard] error", err);
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
