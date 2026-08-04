import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { userRepo } from "@/lib/db/repositories/userRepo";

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const user = await userRepo.get(sessionUser.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "Aucun client Stripe trouvé" }, { status: 400 });
    }
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const portal = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/espace-prestataire`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
