import { NextResponse } from "next/server";
import { sessionRepo, getStoreBackend } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  try {
    const { sessionId, durationSeconds } = await req.json();

    const session = await sessionRepo.get(sessionId);
    if (!session) {
      const res = NextResponse.json(
        { error: "Session introuvable", backend: getStoreBackend(), sessionId },
        { status: 404 }
      );
      res.headers.set("x-store-backend", getStoreBackend());
      return res;
    }

    await sessionRepo.markCompleted(sessionId);
    await eventRepo.log(sessionId, "quiz_completed", { durationSeconds });
    trackServer(sessionId, "quiz_completed", { durationSeconds });

    try {
      const output = await generateWeddingPlan(session.quizAnswers, sessionId);
      await sessionRepo.setAIOutput(sessionId, output);
      const res = NextResponse.json({ ok: true, ready: true });
      res.headers.set("x-store-backend", getStoreBackend());
      return res;
    } catch (err) {
      const res = NextResponse.json({ ok: true, ready: false });
      res.headers.set("x-store-backend", getStoreBackend());
      return res;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
