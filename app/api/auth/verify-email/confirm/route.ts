import { NextResponse } from "next/server";
import { userRepo } from "@/lib/db/repositories/userRepo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return NextResponse.redirect(`${APP_URL}/login?error=token_manquant`);

    const users = await userRepo.list();
    const user = users.find(
      (u) => u.verifyToken === token && u.verifyTokenExpiry && new Date(u.verifyTokenExpiry) > new Date()
    );

    if (!user) {
      return NextResponse.redirect(`${APP_URL}/login?error=token_invalide`);
    }

    await userRepo.update(user.id, {
      emailVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    });

    // Redirige vers le login avec un message de succès
    const params = new URLSearchParams();
    if (user.role === "vendor") params.set("role", "vendor");
    if (user.role === "admin") params.set("role", "admin");
    params.set("verified", "1");
    const redirectUrl = `${APP_URL}/login?${params.toString()}`;
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=erreur`);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token: string | undefined = body.token;
    if (!token) return NextResponse.json({ error: "Token requis" }, { status: 400 });

    const users = await userRepo.list();
    const user = users.find(
      (u) => u.verifyToken === token && u.verifyTokenExpiry && new Date(u.verifyTokenExpiry) > new Date()
    );

    if (!user) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    await userRepo.update(user.id, {
      emailVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
