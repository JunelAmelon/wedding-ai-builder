import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { randomBytes } from "crypto";

const RequestResetSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await userRepo.getByEmail(email.toLowerCase());

    if (!user) {
      // Pour la sécurité, on ne révèle pas si l'email existe ou pas
      return NextResponse.json({ success: true, message: "Si cet email existe, un lien de réinitialisation sera envoyé." });
    }

    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token dans l'utilisateur
    await userRepo.update(user.id, {
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString(),
    } as any);

    // En production, envoyer un email avec le lien
    // Pour le développement, on retourne le token directement
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        success: true,
        message: "Token de réinitialisation généré (mode développement)",
        resetToken,
        resetLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`,
      });
    }

    return NextResponse.json({ success: true, message: "Si cet email existe, un lien de réinitialisation sera envoyé." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la demande de réinitialisation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
