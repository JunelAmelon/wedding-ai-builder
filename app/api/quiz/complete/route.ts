import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCached, setCached, delCached } from "@/lib/cache/redis";

const CompleteQuizSchema = z.object({
  sessionId: z
    .string()
    .trim()
    .min(5, "L'identifiant de session est invalide")
    .max(64, "L'identifiant de session est invalide")
    .regex(/^[A-Za-z0-9_-]+$/, "Format d'identifiant de session invalide"),
  durationSeconds: z.number().nonnegative().max(86400).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    // 1. Validation du Rate Limiting par IP (5 finalisations max par heure par IP)
    const ip = getClientIp(req);
    const ipRateLimit = await checkRateLimit(`quiz:complete:ip:${ip}`, 5, 3600);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Trop de générations demandées depuis cette connexion. Veuillez réessayer plus tard.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(1, Math.ceil((ipRateLimit.resetAt - Date.now()) / 1000)).toString(),
          },
        }
      );
    }

    // 2. Validation du payload avec Zod
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Requête JSON invalide" }, { status: 400 });
    }

    const parsed = CompleteQuizSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Données de formulaire invalides",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { sessionId, durationSeconds } = parsed.data;

    // 3. Rate limiting par session (max 2 requêtes de finalisation par tranche de 15 minutes)
    const sessionRateLimit = await checkRateLimit(`quiz:complete:session:${sessionId}`, 2, 900);
    if (!sessionRateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Cette session a déjà été soumise pour génération IA.",
        },
        { status: 429 }
      );
    }

    // 4. Vérification de l'existence de la session
    const session = await sessionRepo.get(sessionId);
    if (!session) {
      return NextResponse.json({ ok: false, ready: false, error: "Session introuvable" }, { status: 404 });
    }

    // 5. Idempotence : si l'IA a déjà généré le plan pour cette session, ne pas ré-invoquer OpenAI
    if (session.aiOutput) {
      return NextResponse.json({ ok: true, ready: true, cached: true });
    }

    // 6. Validation du contenu du quiz (empêcher les appels abusifs avec un quiz vide)
    const answers = session.quizAnswers || {};
    const filledAnswerCount = Object.keys(answers).filter((k) => {
      const val = answers[k as keyof typeof answers];
      return val !== undefined && val !== null && val !== "";
    }).length;

    if (filledAnswerCount < 2) {
      return NextResponse.json(
        {
          ok: false,
          ready: false,
          error: "Le questionnaire est incomplet. Veuillez renseigner vos réponses avant de finaliser.",
        },
        { status: 400 }
      );
    }

    // 7. Verrou anti-concurrence (thundering herd / burst requests sur la même session)
    const lockKey = `lock:ai-generating:${sessionId}`;
    const isGenerating = await getCached<boolean>(lockKey);
    if (isGenerating) {
      return NextResponse.json({ ok: true, ready: false, generating: true });
    }

    // Poser le verrou pendant la génération (TTL 60s)
    await setCached(lockKey, true, 60);

    // 8. Enregistrement des métriques & finalisation
    await sessionRepo.markCompleted(sessionId);
    await eventRepo.log(sessionId, "quiz_completed", { durationSeconds });
    trackServer(sessionId, "quiz_completed", { durationSeconds });

    // 9. Génération du plan IA avec protection try/catch/finally pour toujours libérer le verrou
    try {
      const output = await generateWeddingPlan(session.quizAnswers, sessionId);
      await sessionRepo.setAIOutput(sessionId, output);
      return NextResponse.json({ ok: true, ready: true });
    } catch (aiErr) {
      console.error(`[quiz/complete] Erreur génération IA pour session ${sessionId}:`, aiErr);
      return NextResponse.json(
        { ok: true, ready: false, error: "La génération du plan a rencontré une erreur temporaire." },
        { status: 500 }
      );
    } finally {
      await delCached(lockKey);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
