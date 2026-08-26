import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { trackServer } from "@/lib/analytics/posthog.server";
import { QUIZ_STEPS } from "@/types/domain";
import type { QuizAnswers } from "@/types/domain";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "@/lib/db/repositories/utils";

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

    let updatePayload: Partial<QuizAnswers> = { [field]: value } as Partial<QuizAnswers>;
    if (step === "style" && typeof value === "object" && value !== null) {
      const styleAnswer = value as { style: unknown; customStyle?: string; customStyleDescription?: string };
      updatePayload = {
        style: styleAnswer.style as QuizAnswers["style"],
        customStyle: styleAnswer.customStyle ?? undefined,
        customStyleDescription: styleAnswer.customStyleDescription ?? undefined,
      } as Partial<QuizAnswers>;
    }

    const session = await sessionRepo.get(sessionId);
    if (!session) {
      const now = new Date().toISOString();
      const newSession = {
        id: sessionId,
        createdAt: now,
        updatedAt: now,
        status: "in_progress" as const,
        quizAnswers: {},
        aiOutput: null,
        leadId: null,
        userId: null,
      };
      if (isLocalMode()) {
        await localStore.set("sessions", sessionId, newSession);
      } else {
        const { getDb } = await import("@/lib/db/firebase");
        await getDb().collection("sessions").doc(sessionId).set(newSession);
      }
      const updated = await sessionRepo.updateAnswers(sessionId, updatePayload);
      await eventRepo.log(sessionId, "quiz_step_completed", { step, stepName: step });
      trackServer(sessionId, "quiz_step_completed", { step });
      return NextResponse.json({ session: updated });
    }

    const updated = await sessionRepo.updateAnswers(sessionId, updatePayload);

    await eventRepo.log(sessionId, "quiz_step_completed", { step, stepName: step });
    trackServer(sessionId, "quiz_step_completed", { step });

    return NextResponse.json({ session: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
