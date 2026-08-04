import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { recordWishlistPayment } from "@/lib/wishlistPayment";

export async function GET(req: NextRequest) {
  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const purchase = await recordWishlistPayment(session);

    return NextResponse.json({ session, purchase });
  } catch (error) {
    console.error("[wishlist/session]", error);
    const stripeError = error as { type?: string; message?: string } | undefined;
    const isStripe = typeof stripeError?.type === "string" && stripeError.type.startsWith("Stripe");
    const message = isStripe && stripeError?.message ? stripeError.message : "Erreur lors de la vérification du paiement";
    return NextResponse.json({ error: message }, { status: isStripe ? 400 : 500 });
  }
}
