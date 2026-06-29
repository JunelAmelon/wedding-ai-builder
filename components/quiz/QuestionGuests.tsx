"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionGuests({ onAnswer }: { onAnswer: (value: number) => void }) {
  const [count, setCount] = useState<number | "">("");

  return (
    <QuestionShell
      title="Combien d'invités environ ?"
      subtitle="Une estimation suffit."
      onNext={() => onAnswer(Number(count))}
      nextDisabled={!count || Number.isNaN(Number(count))}
    >
      <input
        type="number"
        min={1}
        value={count}
        onChange={(e) => setCount(e.target.value ? Number(e.target.value) : "")}
        placeholder="Ex: 120"
        className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </QuestionShell>
  );
}
