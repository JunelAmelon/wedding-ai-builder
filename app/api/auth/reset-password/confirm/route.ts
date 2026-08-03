import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { hashPassword } from "@/lib/auth";

const ConfirmResetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ConfirmResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { token, newPassword } = parsed.data;

    // Trouver l'utilisateur avec ce token valide
    const users = await userRepo.listAll();
    const user = users.find(
      (u) => u.resetToken === token && u.resetTokenExpiry && new Date(u.resetTokenExpiry) > new Date()
    );

    if (!user) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    // Mettre à jour le mot de passe
    await userRepo.update(user.id, {
      passwordHash: hashPassword(newPassword),
      resetToken: null,
      resetTokenExpiry: null,
    } as any);

    return NextResponse.json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la réinitialisation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
