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
              "w-full rounded-r-md border px-4 py-4 text-left transition " +
              (priority === opt.value
                ? "border-ink/25 bg-sage-chip ring-1 ring-ink/10"
                : "border-line bg-white hover:border-ink/20 hover:bg-surface")
            }
            type="button"
          >
            <div className="font-semibold text-text-primary">{opt.label}</div>
          </button>
        ))}
      </div>
    </QuestionShell>
  );
}
