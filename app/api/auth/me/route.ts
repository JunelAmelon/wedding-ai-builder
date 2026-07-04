import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, getFullUser } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

const UpdateMeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
});

export async function GET() {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await getFullUser(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const profile =
    user.role === "couple"
      ? await coupleProfileRepo.getByUserId(user.id)
      : await vendorProfileRepo.getByUserId(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
    },
    profile,
  });
}

export async function PUT(req: Request) {
  try {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateMeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const updateData = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
    await userRepo.update(sessionUser.id, updateData);

    const user = await getFullUser(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const profile =
      user.role === "couple"
        ? await coupleProfileRepo.getByUserId(user.id)
        : await vendorProfileRepo.getByUserId(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        phone: user.phone,
        emailVerified: user.emailVerified,
      },
      profile,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
