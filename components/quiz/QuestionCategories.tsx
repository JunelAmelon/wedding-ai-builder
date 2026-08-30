"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { CATEGORY_OPTIONS } from "@/lib/constants";
import type { DesiredCategory } from "@/types/domain";

export interface CategoriesAnswer {
  desiredCategories: DesiredCategory[];
}

interface QuestionCategoriesProps {
  onAnswer: (value: CategoriesAnswer) => void;
}

export function QuestionCategories({ onAnswer }: QuestionCategoriesProps) {
  const [selected, setSelected] = useState<Set<DesiredCategory>>(new Set());

  function toggle(cat: DesiredCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <QuestionShell
      title="De quels prestataires avez-vous besoin ?"
      subtitle="Sélectionnez tout ce dont vous avez besoin. On vous trouvera les meilleurs dans chaque catégorie."
      onNext={() => onAnswer({ desiredCategories: Array.from(selected) })}
      nextDisabled={selected.size === 0}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORY_OPTIONS.map((opt) => {
          const isSelected = selected.has(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              type="button"
              className={
                "flex items-center gap-2.5 rounded-[28px] border px-4 py-3.5 text-left transition " +
                (isSelected
                  ? "border-[#e64a5d] bg-[#fef2f4] ring-1 ring-[#e64a5d]/20"
                  : "border-[#EDEDF0] bg-white hover:border-[#e64a5d]/30 hover:bg-[#fef2f4]/50")
              }
            >
              <span className="text-xl flex-shrink-0">{opt.icon}</span>
              <span className="text-sm font-medium text-[#0E0E10] leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selected.size > 0 && (
        <p className="mt-4 text-sm text-[#6B6B72]">
          {selected.size} prestataire{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
        </p>
      )}
    </QuestionShell>
  );
}
