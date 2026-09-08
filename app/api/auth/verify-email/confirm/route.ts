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
    const redirectBase = user.role === "vendor" ? "/login?role=vendor" : user.role === "admin" ? "/login?role=admin" : "/login";
    return NextResponse.redirect(`${APP_URL}${redirectBase}&verified=1`);
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
