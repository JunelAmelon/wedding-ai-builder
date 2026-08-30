"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { DIETARY_OPTIONS } from "@/lib/constants";
import type { DietaryNeed } from "@/types/domain";

export interface NeedsAnswer {
  dietaryNeeds: DietaryNeed[];
  dietaryDetails: string;
  mobilityNeeds: boolean;
  guestsFromFar: boolean;
}

interface QuestionNeedsProps {
  onAnswer: (value: NeedsAnswer) => void;
}

export function QuestionNeeds({ onAnswer }: QuestionNeedsProps) {
  const [dietary, setDietary] = useState<Set<DietaryNeed>>(new Set());
  const [dietaryDetails, setDietaryDetails] = useState("");
  const [mobility, setMobility] = useState<boolean | null>(null);
  const [guestsFar, setGuestsFar] = useState<boolean | null>(null);

  function toggleDietary(need: DietaryNeed) {
    setDietary((prev) => {
      const next = new Set(prev);
      if (next.has(need)) next.delete(need);
      else next.add(need);
      return next;
    });
  }

  const hasAllergies = dietary.has("allergies") || dietary.has("autre");

  return (
    <QuestionShell
      title="Des besoins spécifiques pour vos invités ?"
      subtitle="Ces infos aident les traiteurs et lieux à s'adapter parfaitement."
      onNext={() =>
        onAnswer({
          dietaryNeeds: Array.from(dietary),
          dietaryDetails: dietaryDetails.trim(),
          mobilityNeeds: mobility === true,
          guestsFromFar: guestsFar === true,
        })
      }
      nextDisabled={mobility === null || guestsFar === null}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-3">
            Régimes alimentaires
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const isSelected = dietary.has(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleDietary(opt.value)}
                  type="button"
                  className={
                    "rounded-full border px-4 py-2 text-sm font-medium transition " +
                    (isSelected
                      ? "border-[#e64a5d] bg-[#fef2f4] text-[#0E0E10]"
                      : "border-[#EDEDF0] bg-white text-[#6B6B72] hover:border-[#e64a5d]/30")
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {hasAllergies && (
            <input
              value={dietaryDetails}
              onChange={(e) => setDietaryDetails(e.target.value)}
              placeholder="Précisez les allergies ou régimes..."
              className="mt-3 w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4] transition"
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-3">
            Personnes à mobilité réduite
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setMobility(true)}
              type="button"
              className={
                "flex-1 rounded-[28px] border px-4 py-3.5 text-sm font-medium transition " +
                (mobility === true
                  ? "border-[#e64a5d] bg-[#fef2f4] text-[#0E0E10]"
                  : "border-[#EDEDF0] bg-white text-[#6B6B72] hover:border-[#e64a5d]/30")
              }
            >
              Oui
            </button>
            <button
              onClick={() => setMobility(false)}
              type="button"
              className={
                "flex-1 rounded-[28px] border px-4 py-3.5 text-sm font-medium transition " +
                (mobility === false
                  ? "border-[#e64a5d] bg-[#fef2f4] text-[#0E0E10]"
                  : "border-[#EDEDF0] bg-white text-[#6B6B72] hover:border-[#e64a5d]/30")
              }
            >
              Non
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-3">
            Invités venant de loin ou de l'étranger
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setGuestsFar(true)}
              type="button"
              className={
                "flex-1 rounded-[28px] border px-4 py-3.5 text-sm font-medium transition " +
                (guestsFar === true
                  ? "border-[#e64a5d] bg-[#fef2f4] text-[#0E0E10]"
                  : "border-[#EDEDF0] bg-white text-[#6B6B72] hover:border-[#e64a5d]/30")
              }
            >
              Oui
            </button>
            <button
              onClick={() => setGuestsFar(false)}
              type="button"
              className={
                "flex-1 rounded-[28px] border px-4 py-3.5 text-sm font-medium transition " +
                (guestsFar === false
                  ? "border-[#e64a5d] bg-[#fef2f4] text-[#0E0E10]"
                  : "border-[#EDEDF0] bg-white text-[#6B6B72] hover:border-[#e64a5d]/30")
              }
            >
              Non
            </button>
          </div>
        </div>
      </div>
    </QuestionShell>
  );
}
