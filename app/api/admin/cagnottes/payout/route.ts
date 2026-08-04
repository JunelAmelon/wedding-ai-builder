import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { wishlistRepo, wishlistPayoutRepo } from "@/lib/db/repositories/wishlistRepo";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { wishlistId, amount, method, note, paidAt, status } = body;

    if (!wishlistId || !amount || Number(amount) <= 0 || !method || !paidAt) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const wishlist = await wishlistRepo.get(wishlistId);
    if (!wishlist) {
      return NextResponse.json({ error: "Liste introuvable" }, { status: 404 });
    }

    const payout = await wishlistPayoutRepo.create({
      wishlistId,
      amount: Number(amount),
      method,
      note: note || undefined,
      paidAt,
      status: status === "pending" ? "pending" : "completed",
    });

    return NextResponse.json({ payout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
