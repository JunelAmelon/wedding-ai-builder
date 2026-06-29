"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import { ProgressBar } from "@/components/feedback/ProgressBar";
import { useQuizStore, QUIZ_STEPS } from "@/lib/store/quizStore";
import { QuestionDate } from "@/components/quiz/QuestionDate";
import { QuestionLocation } from "@/components/quiz/QuestionLocation";
import { QuestionGuests } from "@/components/quiz/QuestionGuests";
import { QuestionBudget } from "@/components/quiz/QuestionBudget";
import { QuestionStyle } from "@/components/quiz/QuestionStyle";
import { QuestionStress } from "@/components/quiz/QuestionStress";
import { QuestionPriority } from "@/components/quiz/QuestionPriority";
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

const HERO_BY_STEP: Record<QuizStep, { url: string; alt: string }> = {
  date: {
    url: "https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=1800&q=80",
    alt: "Décoration de mariage",
  },
  location: {
    url: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1800&q=80",
    alt: "Destination et voyage",
  },
  guests: {
    url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1800&q=80",
    alt: "Invités lors d'un mariage",
  },
  budget: {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1800&q=80",
    alt: "Budget et planification",
  },
  style: {
    url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1800&q=80",
    alt: "Inspiration de mariage",
  },
  stress: {
    url: "https://images.unsplash.com/photo-1520962917960-0ac1f0913ca4?auto=format&fit=crop&w=1800&q=80",
    alt: "Moment calme",
  },
  priority: {
    url: "https://images.unsplash.com/photo-1523293836415-74e8f16cfa2a?auto=format&fit=crop&w=1800&q=80",
    alt: "Décision et organisation",
  },
};

export default function QuizStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const step = params.step as QuizStep;
  const stepIndex = QUIZ_STEPS.indexOf(step);

  const { sessionId, setSessionId, setAnswer, setStartedAt, startedAt } = useQuizStore();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function ensureSession() {
      if (!sessionId) {
        try {
          const res = await fetch("/api/quiz/start", { method: "POST" });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Erreur de démarrage du quiz");
          }
          setSessionId(data.sessionId);
          setStartedAt(Date.now());
          track("quiz_started", { sessionId: data.sessionId });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Impossible de démarrer le quiz";
          setError(message);
        }
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
    setAnswer(field as never, value as never);
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

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-black/10 bg-white p-8 shadow-[0_30px_80px_rgba(11,15,26,0.08)] text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-warning/15 border border-warning/25 flex items-center justify-center mb-6">
            <TriangleAlert className="text-warning" size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">Le quiz ne peut pas démarrer</h1>
          <p className="text-text-secondary mt-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-white font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const hero = HERO_BY_STEP[step] ?? HERO_BY_STEP.date;

  return (
    <div className="bg-background min-h-[100dvh]">
      <ProgressBar current={stepIndex + 1} total={QUIZ_STEPS.length} />

      <div className="grid lg:grid-cols-2 min-h-[100dvh]">
        <div className="px-6 pt-20 pb-10 lg:pt-24">
          <div className="max-w-xl mx-auto w-full">
            <div className="relative h-44 sm:h-56 rounded-3xl overflow-hidden border border-black/10 shadow-[0_20px_60px_rgba(11,15,26,0.06)] lg:hidden">
              <Image src={hero.url} alt={hero.alt} fill className="object-cover" sizes="100vw" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            </div>

            <div className="mt-8">
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
          </div>
        </div>

        <div className="hidden lg:block relative">
          <Image src={hero.url} alt={hero.alt} fill className="object-cover" sizes="50vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.20),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.20),transparent_55%)]" />
        </div>
      </div>
    </div>
  );
}
