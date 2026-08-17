import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { action } = body;
    if (!["activate", "cancel", "start_trial", "postpone"].includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const subscription = await adminRepo.getUserSubscriptionById(params.id);
    if (!subscription) {
      return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
    }

    if (action === "start_trial") {
      const days = Math.min(Math.max(Number(body.days) || 7, 1), 30);
      const newEnd = addDays(new Date().toISOString(), days);
      if (subscription.stripeSubscriptionId) {
        try {
          const trialEnd = Math.floor(new Date(newEnd).getTime() / 1000);
          await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { trial_end: trialEnd });
        } catch {
          // ignore Stripe error, keep DB as source of truth for trials
        }
      }
      await adminRepo.updateUserSubscription(params.id, {
        status: "trialing",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: newEnd,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "postpone") {
      const days = Math.min(Math.max(Number(body.days) || 7, 1), 60);
      const base = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date()
        ? subscription.currentPeriodEnd
        : new Date().toISOString();
      const newEnd = addDays(base, days);
      if (subscription.stripeSubscriptionId) {
        try {
          const trialEnd = Math.floor(new Date(newEnd).getTime() / 1000);
          await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { trial_end: trialEnd });
        } catch {
          // ignore Stripe error, keep DB as source of truth
        }
      }
      await adminRepo.updateUserSubscription(params.id, {
        currentPeriodEnd: newEnd,
        status: subscription.status === "past_due" || subscription.status === "unpaid" ? "active" : subscription.status,
      });
      return NextResponse.json({ success: true });
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: "Abonnement Stripe introuvable" }, { status: 404 });
    }

    if (action === "cancel") {
      await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: true });
      await adminRepo.updateUserSubscription(params.id, { status: "canceled" });
    } else {
      await getStripe().subscriptions.update(subscription.stripeSubscriptionId, { cancel_at_period_end: false });
      await adminRepo.updateUserSubscription(params.id, { status: "active" });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
