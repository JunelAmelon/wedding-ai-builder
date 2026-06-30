import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo, getStoreBackend } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { QUIZ_STEPS } from "@/types/domain";

const AnswerSchema = z.object({
  sessionId: z.string().min(1),
  step: z.enum(QUIZ_STEPS),
  value: z.unknown(),
});

const FIELD_BY_STEP: Record<string, string> = {
  date: "weddingDate",
  location: "location",
  guests: "guestCount",
  budget: "budget",
  style: "style",
  stress: "stressLevel",
  priority: "mainPriority",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId, step, value } = parsed.data;
    const field = FIELD_BY_STEP[step];

    let updatePayload: Record<string, unknown> = { [field]: value };
    if (step === "style" && typeof value === "object" && value !== null) {
      const styleAnswer = value as { style: unknown; customStyle?: string; customStyleDescription?: string };
      updatePayload = {
        style: styleAnswer.style,
        customStyle: styleAnswer.customStyle ?? null,
        customStyleDescription: styleAnswer.customStyleDescription ?? null,
      };
    }

    const session = await sessionRepo.get(sessionId);
    if (!session) {
      const res = NextResponse.json(
        { error: "Session introuvable", backend: getStoreBackend(), sessionId },
        { status: 404 }
      );
      res.headers.set("x-store-backend", getStoreBackend());
      return res;
    }

    const updated = await sessionRepo.updateAnswers(sessionId, { [field]: value } as never);

    await eventRepo.log(sessionId, "quiz_step_completed", { step, stepName: step });
    trackServer(sessionId, "quiz_step_completed", { step });

    const res = NextResponse.json({ session: updated });
    res.headers.set("x-store-backend", getStoreBackend());
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
