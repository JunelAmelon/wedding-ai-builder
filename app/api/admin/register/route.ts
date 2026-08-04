import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

const RegisterSchema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { token, firstName, lastName, password } = parsed.data;
    const invite = await adminRepo.getInvitationByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Invitation invalide" }, { status: 404 });
    }
    if (invite.acceptedAt) {
      return NextResponse.json({ error: "Invitation déjà utilisée" }, { status: 409 });
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Invitation expirée" }, { status: 410 });
    }

    const existing = await userRepo.getByEmail(invite.email);
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }

    const user = await userRepo.create({
      email: invite.email.toLowerCase(),
      passwordHash: hashPassword(password),
      googleId: null,
      firstName,
      lastName,
      avatarUrl: null,
      phone: null,
      address: null,
      role: "admin",
      adminRole: invite.role,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: false,
      resetToken: null,
      resetTokenExpiry: null,
    });

    await adminRepo.markInvitationAccepted(invite.id, user.id);

    const sessionToken = createSession(user);
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, adminRole: user.adminRole },
    });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
