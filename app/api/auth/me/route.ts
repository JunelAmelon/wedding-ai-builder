import { NextResponse } from "next/server";
import { getSessionUser, getFullUser } from "@/lib/auth";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

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
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
    },
    profile,
  });
}
