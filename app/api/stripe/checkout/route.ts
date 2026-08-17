import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getVendorPlanById } from "@/lib/subscriptions";
import { userRepo } from "@/lib/db/repositories/userRepo";
import type Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const user = await userRepo.get(sessionUser.id);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const { planId = "essential", trialDays } = await req.json().catch(() => ({}));
    const plan = getVendorPlanById(planId);
    const priceId = plan?.stripePriceId;

    if (!priceId) {
      return NextResponse.json({ error: "Configuration Stripe incomplète pour ce plan" }, { status: 500 });
    }

    const days = Number(trialDays);
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: { userId: user.id, planId: plan?.id || planId },
    };
    if (days > 0) {
      subscriptionData.trial_period_days = days;
    }

    let customerId = user.stripeCustomerId;
    if (customerId) {
      try {
        const existing = await getStripe().customers.retrieve(customerId);
        if ((existing as Stripe.DeletedCustomer).deleted) {
          customerId = null;
        }
      } catch {
        // Customer introuvable ou clé/SK changée : on en recrée un
        customerId = null;
      }
    }
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await userRepo.update(user.id, { stripeCustomerId: customerId });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/espace-prestataire?subscription=success`,
      cancel_url: `${origin}/espace-prestataire?subscription=cancel`,
      subscription_data: subscriptionData,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
