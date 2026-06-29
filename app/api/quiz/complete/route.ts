import { NextResponse } from "next/server";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  try {
    const { sessionId, durationSeconds } = await req.json();

    const session = await sessionRepo.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    await sessionRepo.markCompleted(sessionId);
    await eventRepo.log(sessionId, "quiz_completed", { durationSeconds });
    trackServer(sessionId, "quiz_completed", { durationSeconds });

    try {
      const output = await generateWeddingPlan(session.quizAnswers, sessionId);
      await sessionRepo.setAIOutput(sessionId, output);
      return NextResponse.json({ ok: true, ready: true });
    } catch {
      return NextResponse.json({ ok: true, ready: false });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
