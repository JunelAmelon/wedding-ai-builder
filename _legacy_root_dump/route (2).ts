import { NextResponse } from "next/server";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  const { sessionId, durationSeconds } = await req.json();

  const session = await sessionRepo.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  await sessionRepo.markCompleted(sessionId);
  await eventRepo.log(sessionId, "quiz_completed", { durationSeconds });
  trackServer(sessionId, "quiz_completed", { durationSeconds });

  // Génération IA déclenchée immédiatement (masquée derrière l'écran de gate côté client).
  // On ne bloque pas la réponse HTTP plus que nécessaire mais on attend la génération
  // ici car Vercel Functions ne garantissent pas l'exécution post-réponse sans config dédiée.
  try {
    const output = await generateWeddingPlan(session.quizAnswers, sessionId);
    await sessionRepo.setAIOutput(sessionId, output);
    return NextResponse.json({ ok: true, ready: true });
  } catch (err) {
    // Ne jamais exposer une erreur brute au client : le résultat utilisera le fallback déterministe
    // déjà géré au niveau de l'orchestrateur. Si on arrive ici, c'est une erreur réseau/imprévue.
    return NextResponse.json({ ok: true, ready: false });
  }
}
