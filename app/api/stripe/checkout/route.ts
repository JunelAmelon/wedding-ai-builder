import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getVendorPlanById } from "@/lib/subscriptions";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type Stripe from "stripe";

const CheckoutSchema = z.object({
  planId: z.enum(["essential", "premium", "elite"]),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    if (sessionUser.role !== "vendor" && sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`stripe-checkout:${sessionUser.id}:${ip}`, 10, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez patienter une minute." },
        { status: 429 }
      );
    }

    const user = await userRepo.get(sessionUser.id);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const rawBody = await req.json().catch(() => ({}));
    const parsed = CheckoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Plan sélectionné invalide. Choix possibles : essential, premium, elite." },
        { status: 400 }
      );
    }

    const { planId } = parsed.data;
    const plan = getVendorPlanById(planId);
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        { error: "Configuration Stripe incomplète pour ce plan tarifaire." },
        { status: 500 }
      );
    }

    // Le nombre de jours d'essai gratuit N'EST JAMAIS contrôlé par le client.
    // Toute période d'essai ne peut être activée que par l'administration via /api/admin/subscriptions/[id].
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: { userId: user.id, planId: plan.id },
    };

    let customerId = user.stripeCustomerId;
    if (customerId) {
      try {
        const existing = await getStripe().customers.retrieve(customerId);
        if ((existing as Stripe.DeletedCustomer).deleted) {
          customerId = null;
        }
      } catch {
        customerId = null;
      }
    }
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await userRepo.update(user.id, { stripeCustomerId: customerId });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${origin}/espace-prestataire?subscription=success`,
      cancel_url: `${origin}/espace-prestataire?subscription=cancel`,
      subscription_data: subscriptionData,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
