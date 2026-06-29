"use client";

import { useMemo, useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { CURRENCY_OPTIONS } from "@/lib/constants";

export function QuestionBudget({
  onAnswer,
}: {
  onAnswer: (value: { amount: number; currency: string }) => void;
}) {
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState("EUR");

  const disabled = useMemo(() => !amount || Number.isNaN(Number(amount)), [amount]);

  return (
    <QuestionShell
      title="Quel est votre budget total ?"
      subtitle="On s'en sert pour le breakdown détaillé."
      onNext={() => onAnswer({ amount: Number(amount), currency })}
      nextDisabled={disabled}
    >
      <div className="space-y-3">
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
          placeholder="Ex: 15000"
          className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </QuestionShell>
  );
}
