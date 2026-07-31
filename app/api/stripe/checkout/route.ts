import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";
import { userRepo } from "@/lib/db/repositories/userRepo";

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const user = await userRepo.get(sessionUser.id);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    if (!STRIPE_PRICE_ID) {
      return NextResponse.json({ error: "Configuration Stripe incomplète" }, { status: 500 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await userRepo.update(user.id, { stripeCustomerId: customerId });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/espace-prestataire?subscription=success`,
      cancel_url: `${origin}/espace-prestataire?subscription=cancel`,
      subscription_data: { metadata: { userId: user.id } },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
