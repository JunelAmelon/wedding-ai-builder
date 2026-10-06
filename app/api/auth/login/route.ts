import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";
import { runAutoMatching } from "@/lib/matching/auto-match";

const LoginSchema = z.object({
  email: z.string().trim().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(req: Request) {
  try {
    // 1. Rate limiting global par IP (15 requêtes max par minute)
    const ip = getClientIp(req);
    const ipLimit = await checkRateLimit(`login:ip:${ip}`, 15, 60);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives depuis cette adresse. Réessayez dans une minute." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide" }, { status: 400 });
    }

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Rate limiting ciblé par compte (5 tentatives échouées max par 15 minutes)
    const accountLimit = await checkRateLimit(`login:account:${normalizedEmail}`, 5, 900);
    if (!accountLimit.allowed) {
      return NextResponse.json(
        {
          error: "Trop de tentatives infructueuses sur ce compte. Veuillez réessayer dans 15 minutes ou réinitialiser votre mot de passe.",
        },
        { status: 429 }
      );
    }

    const user = await userRepo.getByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    // Réinitialisation du verrouillage de compte en cas de mot de passe correct
    await resetRateLimit(`login:account:${normalizedEmail}`);

    // Email verification required (except for admins who are invited)
    if (!user.emailVerified && user.role !== "admin") {
      return NextResponse.json({
        error: "Veuillez vérifier votre adresse email pour vous connecter. Un lien de vérification vous a été envoyé à votre inscription.",
        needVerification: true,
        email: user.email,
      }, { status: 403 });
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

    // For couples: trigger auto-matching once on first verified login if no matches exist yet.
    // Do NOT await to keep login fast; matching runs in the background.
    if (user.role === "couple") {
      (async () => {
        try {
          const projects = await projectRepo.listByUser(user.id);
          const project = projects[0];
          if (project) {
            const existingMatches = await matchRepo.listByProject(project.id);
            if (existingMatches.length === 0) {
              await runAutoMatching(project, { perCategory: 3, notifyVendors: true });
            }
          }
        } catch (matchErr) {
          console.error("[login] Auto-matching failed:", matchErr);
        }
      })();
    }

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
