"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionStress({ onAnswer }: { onAnswer: (value: number) => void }) {
  const [level, setLevel] = useState(5);

  return (
    <QuestionShell
      title="Quel est votre niveau de stress actuel ?"
      subtitle="1 = zen, 10 = très stressé(e)."
      onNext={() => onAnswer(level)}
      nextDisabled={false}
    >
      <div className="space-y-4">
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="rounded-2xl border border-black/10 bg-surface p-4 text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-text-secondary">Votre ressenti</div>
          <div className="font-serif text-3xl font-bold mt-2 text-text-primary">{level}/10</div>
          <div className="text-sm text-text-secondary mt-1">
            {level <= 3 ? "Plutôt zen" : level <= 6 ? "Un peu de pression" : "Très chargé"}
          </div>
        </div>
      </div>
    </QuestionShell>
  );
}
