import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { wishlistRepo, wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Configuration Stripe manquante : STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const { shareToken, itemId, guestName, guestEmail, amount, message } = await req.json();

    if (!shareToken || !guestName || !guestEmail || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const wishlist = await wishlistRepo.getByShareToken(shareToken);
    if (!wishlist) {
      return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });
    }

    let item = null;
    let unitAmount = Math.round(Number(amount) * 100);
    let productName = "Contribution à la cagnotte";

    if (itemId) {
      item = await wishlistItemRepo.get(itemId);
      if (!item || item.wishlistId !== wishlist.id) {
        return NextResponse.json({ error: "Cadeau introuvable" }, { status: 404 });
      }
      if (item.remaining <= 0) {
        return NextResponse.json({ error: "Ce cadeau n'est plus disponible" }, { status: 400 });
      }
      unitAmount = Math.round(Number(item.price) * 100);
      productName = `Offrir : ${item.name}`;
    }

    if (!Number.isFinite(unitAmount) || unitAmount < 1) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: productName,
              description: `Liste de mariage - ${wishlist.title}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        wishlistId: wishlist.id,
        shareToken,
        itemId: item?.id || "",
        itemName: item?.name || "",
        guestName,
        guestEmail,
        message: (message || "").slice(0, 500),
      },
      success_url: `${origin}/wishlist/${shareToken}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wishlist/${shareToken}?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[wishlist/checkout]", error);
    const stripeError = error as { type?: string; message?: string } | undefined;
    const isStripe = typeof stripeError?.type === "string" && stripeError.type.startsWith("Stripe");
    const message = isStripe && stripeError?.message ? stripeError.message : "Erreur lors de la création du paiement";
    return NextResponse.json({ error: message }, { status: isStripe ? 400 : 500 });
  }
}
