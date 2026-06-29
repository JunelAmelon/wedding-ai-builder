"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionLocation({
  onAnswer,
}: {
  onAnswer: (value: { city: string; country: string }) => void;
}) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  return (
    <QuestionShell
      title="Où aura lieu le mariage ?"
      subtitle="Ville + pays suffisent."
      onNext={() => onAnswer({ city, country })}
      nextDisabled={!city || !country}
    >
      <div className="space-y-3">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ville"
          className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Pays"
          className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </QuestionShell>
  );
}
