"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionStress({ onAnswer }: { onAnswer: (value: number) => void }) {
  const [level, setLevel] = useState(5);

  return (
    <QuestionShell
      title="Quel est votre niveau de stress actuel ?"
      subtitle="1 = zen, 10 = très stressé(e). On adaptera le ton de nos conseils."
      onNext={() => onAnswer(level)}
      nextDisabled={false}
      nextLabel="Voir mon plan"
    >
      <div className="space-y-4">
        <input
          type="range"
          min={1}
          max={10}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full accent-[#e64a5d]"
        />
        <div className="rounded-[28px] border border-[#EDEDF0] bg-[#fef2f4]/50 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.22em] text-[#6B6B72]">Votre ressenti</div>
          <div className="font-allura text-3xl font-bold mt-2 text-[#0E0E10]">{level}/10</div>
          <div className="text-sm text-[#6B6B72] mt-1">
            {level <= 3 ? "Plutôt zen" : level <= 6 ? "Un peu de pression" : "Très chargé"}
          </div>
        </div>
      </div>
    </QuestionShell>
  );
}
