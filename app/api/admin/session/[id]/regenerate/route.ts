import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";
import { delCached } from "@/lib/cache/redis";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = params;
  try {
    const session = await sessionRepo.get(id);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    const output = await generateWeddingPlan(session.quizAnswers, id);
    await sessionRepo.setAIOutput(id, output);
    await delCached(`ai-output:${id}`);

    return NextResponse.json({ ok: true, sessionId: id, usedFallback: output.cacheHit ?? false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    console.error("[admin/session/regenerate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
