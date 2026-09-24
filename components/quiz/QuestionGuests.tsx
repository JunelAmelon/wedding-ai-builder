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

  const valid =
    count !== "" &&
    !Number.isNaN(Number(count)) &&
    Number(count) > 0 &&
    (children === "" || (!Number.isNaN(Number(children)) && Number(children) >= 0));

  return (
    <QuestionShell
      title="Combien d'invités environ ?"
      subtitle="Une estimation suffit. Séparez les adultes et les enfants."
      onNext={() =>
        onAnswer({
          guestCount: Math.max(1, Number(count)),
          childrenCount: Math.max(0, Number(children) || 0),
        })
      }
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
            step="1"
            value={count}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setCount("");
              } else {
                const num = Number(val);
                if (!Number.isNaN(num) && num >= 0) setCount(num);
              }
            }}
            placeholder="Ex: 120"
            className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#E4DBFB] transition"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">
            Dont enfants (optionnel)
          </label>
          <input
            type="number"
            min={0}
            step="1"
            value={children}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setChildren("");
              } else {
                const num = Number(val);
                if (!Number.isNaN(num) && num >= 0) setChildren(num);
              }
            }}
            placeholder="Ex: 15"
            className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#E4DBFB] transition"
          />
        </div>
      </div>
    </QuestionShell>
  );
}
