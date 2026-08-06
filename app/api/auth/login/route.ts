import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = await checkRateLimit(`login:${ip}`, 10, 60);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await userRepo.getByEmail(email);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    if (user.role === "vendor") {
      const profile = await vendorProfileRepo.getByUserId(user.id);
      if (!profile || profile.status !== "approved") {
        return NextResponse.json({
          error: "Votre profil professionnel est en cours de validation. Vous recevrez un email dès qu'il sera approuvé.",
          pending: true,
        }, { status: 403 });
      }
    }

    const token = createSession(user);
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la connexion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
