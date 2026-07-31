"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionDate({ onAnswer }: { onAnswer: (value: string) => void }) {
  const [date, setDate] = useState("");

  return (
    <QuestionShell
      title="Quelle est la date de votre mariage ?"
      subtitle="Même une estimation nous aide à générer une timeline réaliste."
      onNext={() => onAnswer(date)}
      nextDisabled={!date}
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-r-md bg-surface border border-line px-4 py-4 text-text-primary placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30 focus:bg-white transition"
      />
    </QuestionShell>
  );
}
