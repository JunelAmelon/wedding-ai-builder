"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionDate({ onAnswer }: { onAnswer: (value: string) => void }) {
  const [date, setDate] = useState("");
  const [notFixed, setNotFixed] = useState(false);

  return (
    <QuestionShell
      title="Quelle est la date de votre mariage ?"
      subtitle={notFixed ? "Donnez une date approximative — vous pourrez la modifier plus tard." : "Même une estimation nous aide à générer une timeline réaliste."}
      onNext={() => onAnswer(date)}
      nextDisabled={!date}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
            {notFixed ? "Date approximative" : "Date du mariage"}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] focus:outline-none focus:border-[#fef2f4] transition"
          />
        </div>
        <button
          type="button"
          onClick={() => setNotFixed(!notFixed)}
          className={
            "flex items-center gap-3 rounded-[28px] border px-4 py-3.5 text-left transition " +
            (notFixed
              ? "border-[#e64a5d] bg-[#fef2f4] text-[#0E0E10]"
              : "border-[#EDEDF0] bg-white text-[#6B6B72] hover:border-[#e64a5d]/30")
          }
        >
          <div
            className={
              "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " +
              (notFixed ? "border-[#e64a5d] bg-[#e64a5d]" : "border-[#EDEDF0]")
            }
          >
            {notFixed && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <span className="text-sm font-medium">Pas encore fixée (date approximative)</span>
        </button>
      </div>
    </QuestionShell>
  );
}
