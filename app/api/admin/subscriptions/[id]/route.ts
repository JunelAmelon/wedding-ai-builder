import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { adminRepo } from "@/lib/db/repositories/adminRepo";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { action } = await req.json();
    if (!["activate", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const subscription = await adminRepo.getUserSubscriptionById(params.id);
    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
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
