import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const user = await userRepo.get(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Compte sans mot de passe" }, { status: 400 });
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 403 });
    }

    await userRepo.update(user.id, { passwordHash: hashPassword(newPassword) });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
