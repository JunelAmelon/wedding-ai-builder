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
      subtitle="Ça influencera nos recommandations et l'ordre de vos étapes."
      onNext={() => priority && onAnswer(priority)}
      nextDisabled={!priority}
      nextLabel="Continuer"
    >
      <div className="space-y-3">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPriority(opt.value)}
            className={
              "w-full rounded-[28px] border px-4 py-4 text-left transition " +
              (priority === opt.value
                ? "border-[#e64a5d] bg-[#fef2f4] ring-1 ring-[#e64a5d]/20"
                : "border-[#EDEDF0] bg-white hover:border-[#e64a5d]/30 hover:bg-[#fef2f4]/50")
            }
            type="button"
          >
            <div className="font-semibold text-[#0E0E10]">{opt.label}</div>
          </button>
        ))}
      </div>
    </QuestionShell>
  );
}
