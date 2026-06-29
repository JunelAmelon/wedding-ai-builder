"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ProgressBar } from "@/components/feedback/ProgressBar";
import { useQuizStore, QUIZ_STEPS } from "@/lib/store/quizStore";
import { QuestionDate } from "../components/QuestionDate";
import { QuestionLocation } from "../components/QuestionLocation";
import { QuestionGuests } from "../components/QuestionGuests";
import { QuestionBudget } from "../components/QuestionBudget";
import { QuestionStyle } from "../components/QuestionStyle";
import { QuestionStress } from "../components/QuestionStress";
import { QuestionPriority } from "../components/QuestionPriority";
import { track } from "@/lib/analytics/posthog.client";
import type { QuizStep } from "@/types/domain";

const FIELD_BY_STEP: Record<QuizStep, string> = {
  date: "weddingDate",
  location: "location",
  guests: "guestCount",
  budget: "budget",
  style: "style",
  stress: "stressLevel",
  priority: "mainPriority",
};

export default function QuizStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const step = params.step as QuizStep;
  const stepIndex = QUIZ_STEPS.indexOf(step);

  const { sessionId, setSessionId, setAnswer, setStartedAt, startedAt } = useQuizStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function ensureSession() {
      if (!sessionId) {
        const res = await fetch("/api/quiz/start", { method: "POST" });
        const data = await res.json();
        setSessionId(data.sessionId);
        setStartedAt(Date.now());
        track("quiz_started", { sessionId: data.sessionId });
      }
      setReady(true);
    }
    ensureSession();
  }, [sessionId, setSessionId, setStartedAt]);

  if (stepIndex === -1) {
    router.replace("/quiz/date");
    return null;
  }

  async function handleAnswer(value: unknown) {
    const field = FIELD_BY_STEP[step];
    setAnswer(field as keyof typeof FIELD_BY_STEP, value as never);
    track("quiz_step_completed", { step });

    if (sessionId) {
      fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step, value }),
      }).catch(() => {});
    }

    const nextIndex = stepIndex + 1;
    if (nextIndex < QUIZ_STEPS.length) {
      router.push(`/quiz/${QUIZ_STEPS[nextIndex]}`);
    } else {
      // Dernière question -> complete + redirection vers le gate
      const durationSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : null;
      track("quiz_completed", { sessionId, durationSeconds });
      if (sessionId) {
        fetch("/api/quiz/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, durationSeconds }),
        }).catch(() => {});
      }
      router.push("/gate");
    }
  }

  if (!ready) {
    return <div className="min-h-[100dvh] bg-background" />;
  }

  return (
    <div className="bg-background min-h-[100dvh]">
      <ProgressBar current={stepIndex + 1} total={QUIZ_STEPS.length} />
      <AnimatePresence mode="wait">
        {step === "date" && <QuestionDate key="date" onAnswer={handleAnswer} />}
        {step === "location" && <QuestionLocation key="location" onAnswer={handleAnswer} />}
        {step === "guests" && <QuestionGuests key="guests" onAnswer={handleAnswer} />}
        {step === "budget" && <QuestionBudget key="budget" onAnswer={handleAnswer} />}
        {step === "style" && <QuestionStyle key="style" onAnswer={handleAnswer} />}
        {step === "stress" && <QuestionStress key="stress" onAnswer={handleAnswer} />}
        {step === "priority" && <QuestionPriority key="priority" onAnswer={handleAnswer} />}
      </AnimatePresence>
    </div>
  );
}
