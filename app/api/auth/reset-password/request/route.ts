import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { sendPasswordResetEmail } from "@/lib/email/smtp";
import { randomBytes } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RequestResetSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = await checkRateLimit(`reset-request:${ip}`, 3, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = RequestResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await userRepo.getByEmail(email.toLowerCase());

    if (!user) {
      // Pour la sécurité, on ne révèle pas si l'email existe ou pas
      return NextResponse.json({ success: true, message: "Si cette adresse est associée à un compte, vous recevrez un email de réinitialisation à l'adresse indiquée." });
    }

    // Générer un token de réinitialisation
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token dans l'utilisateur
    await userRepo.update(user.id, {
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString(),
    } as any);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({ success: true, message: "Un email de réinitialisation a été envoyé à l'adresse indiquée." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la demande de réinitialisation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
