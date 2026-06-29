"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { PRIORITY_OPTIONS } from "@/lib/constants";
import type { MainPriority } from "@/types/domain";

export function QuestionPriority({ onAnswer }: { onAnswer: (value: MainPriority) => void }) {
  const [priority, setPriority] = useState<MainPriority | null>(null);

  return (
    <QuestionShell
      title="Quelle est votre priorité n°1 ?"
      subtitle="Ça influencera les recommandations."
      onNext={() => priority && onAnswer(priority)}
      nextDisabled={!priority}
      nextLabel="Voir mon plan"
    >
      <div className="space-y-3">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPriority(opt.value)}
            className={
              "w-full rounded-xl border px-4 py-4 text-left transition " +
              (priority === opt.value
                ? "border-primary bg-primary/10"
                : "border-black/10 bg-white hover:border-black/20")
            }
            type="button"
          >
            <div className="font-semibold">{opt.label}</div>
          </button>
        ))}
      </div>
    </QuestionShell>
  );
}
