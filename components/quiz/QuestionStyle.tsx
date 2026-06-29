"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import {
  Crown,
  Gem,
  type LucideIcon,
  Leaf,
  Plane,
  Sparkles,
  Trees,
} from "lucide-react";
import type { WeddingStyle } from "@/types/domain";

export function QuestionStyle({ onAnswer }: { onAnswer: (value: WeddingStyle) => void }) {
  const [style, setStyle] = useState<WeddingStyle | null>(null);

  const options: { value: WeddingStyle; label: string; icon: LucideIcon }[] = [
    { value: "boheme", label: "Bohème", icon: Leaf },
    { value: "classique", label: "Classique & élégant", icon: Crown },
    { value: "moderne", label: "Moderne & minimaliste", icon: Sparkles },
    { value: "destination", label: "Destination wedding", icon: Plane },
    { value: "rustique", label: "Rustique & champêtre", icon: Trees },
    { value: "luxe", label: "Luxe & raffiné", icon: Gem },
  ];

  return (
    <QuestionShell
      title="Quel style vous inspire le plus ?"
      subtitle="Choisis l'ambiance dominante."
      onNext={() => style && onAnswer(style)}
      nextDisabled={!style}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = style === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => setStyle(opt.value)}
              type="button"
              className={
                "rounded-2xl border bg-white px-4 py-4 text-left transition shadow-[0_12px_40px_rgba(11,15,26,0.06)] " +
                (selected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-black/10 hover:border-black/20")
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className={
                    "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 " +
                    (selected
                      ? "bg-primary/10 border-primary/15 text-primary"
                      : "bg-surface border-black/10 text-text-secondary")
                  }
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight text-text-primary truncate">{opt.label}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    {selected ? "Sélectionné" : "Choisir"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </QuestionShell>
  );
}
