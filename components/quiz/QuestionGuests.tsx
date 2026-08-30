"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export interface GuestsAnswer {
  guestCount: number;
  childrenCount: number;
}

export function QuestionGuests({ onAnswer }: { onAnswer: (value: GuestsAnswer) => void }) {
  const [count, setCount] = useState<number | "">("");
  const [children, setChildren] = useState<number | "">("");

  const valid = count !== "" && !Number.isNaN(Number(count));

  return (
    <QuestionShell
      title="Combien d'invités environ ?"
      subtitle="Une estimation suffit. Séparez les adultes et les enfants."
      onNext={() => onAnswer({ guestCount: Number(count), childrenCount: Number(children) || 0 })}
      nextDisabled={!valid}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
            Nombre total d'invités
          </label>
          <input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Ex: 120"
            className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4] transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
            Dont enfants (optionnel)
          </label>
          <input
            type="number"
            min={0}
            value={children}
            onChange={(e) => setChildren(e.target.value ? Number(e.target.value) : "")}
            placeholder="Ex: 15"
            className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4] transition"
          />
        </div>
      </div>
    </QuestionShell>
  );
}
