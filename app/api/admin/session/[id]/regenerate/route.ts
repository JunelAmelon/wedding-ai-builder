import { NextResponse } from "next/server";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";
import { delCached } from "@/lib/cache/redis";

function checkPassword(req: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${password}`;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!checkPassword(req)) {
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
