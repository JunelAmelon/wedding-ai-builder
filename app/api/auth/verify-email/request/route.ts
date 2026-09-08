import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { sendEmail } from "@/lib/email/send";
import { verifyEmail } from "@/lib/email/emails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email: string | undefined = body.email;
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const user = await userRepo.getByEmail(email);
    if (!user) {
      // Ne pas révéler si l'email existe
      return NextResponse.json({ ok: true });
    }

    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
    await userRepo.update(user.id, {
      verifyToken: token,
      verifyTokenExpiry: expiry,
    });

    const verifyUrl = `${APP_URL}/api/auth/verify-email/confirm?token=${token}`;
    const { subject, html } = verifyEmail({
      firstName: user.firstName,
      verifyUrl,
    });
    await sendEmail({ to: user.email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
