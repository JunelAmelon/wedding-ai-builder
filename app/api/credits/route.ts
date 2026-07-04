import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { creditRepo } from "@/lib/db/repositories/creditRepo";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";

const PurchaseSchema = z.object({
  amount: z.number().positive(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const transactions = await creditRepo.listByVendor(profile.id);
    return NextResponse.json({ credits: profile.credits, transactions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const body = await req.json();
    const parsed = PurchaseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { amount } = parsed.data;
    const newCredits = profile.credits + amount;
    await vendorProfileRepo.updateCredits(profile.id, newCredits);
    await creditRepo.create({
      vendorId: profile.id,
      amount,
      type: "purchase",
      description: `Achat de ${amount} roses`,
      proposalId: null,
    });

    await notificationRepo.create({
      userId: user.id,
      type: "credits_purchased",
      title: "Roses ajoutées",
      content: `${amount} roses ont été ajoutées à votre compte.`,
      link: "/espace-prestataire/credits",
    });

    return NextResponse.json({ credits: newCredits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
