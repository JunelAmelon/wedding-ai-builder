"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import {
  Crown,
  Gem,
  type LucideIcon,
  Leaf,
  PenTool,
  Plane,
  Sparkles,
  Trees,
} from "lucide-react";
import type { WeddingStyle } from "@/types/domain";

export interface StyleAnswer {
  style: WeddingStyle;
  customStyle?: string;
  customStyleDescription?: string;
}

interface QuestionStyleProps {
  onAnswer: (value: StyleAnswer) => void;
}

export function QuestionStyle({ onAnswer }: QuestionStyleProps) {
  const [style, setStyle] = useState<WeddingStyle | null>(null);
  const [customStyle, setCustomStyle] = useState("");
  const [customStyleDescription, setCustomStyleDescription] = useState("");

  const options: { value: WeddingStyle; label: string; icon: LucideIcon }[] = [
    { value: "boheme", label: "Bohème", icon: Leaf },
    { value: "classique", label: "Classique & élégant", icon: Crown },
    { value: "moderne", label: "Moderne & minimaliste", icon: Sparkles },
    { value: "destination", label: "Destination wedding", icon: Plane },
    { value: "rustique", label: "Rustique & champêtre", icon: Trees },
    { value: "luxe", label: "Luxe & raffiné", icon: Gem },
    { value: "autre", label: "Autre thème", icon: PenTool },
  ];

  const isOther = style === "autre";
  const canProceed = style && (!isOther || (customStyle.trim() && customStyleDescription.trim()));

  return (
    <QuestionShell
      title="Quel style vous inspire le plus ?"
      subtitle="Choisis l'ambiance dominante."
      onNext={() => {
        if (!style) return;
        if (isOther) {
          onAnswer({ style, customStyle: customStyle.trim(), customStyleDescription: customStyleDescription.trim() });
        } else {
          onAnswer({ style });
        }
      }}
      nextDisabled={!canProceed}
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

      {isOther && (
        <div className="mt-6 space-y-4 rounded-2xl border border-black/10 bg-surface p-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Votre thème *</label>
            <input
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Ex. Gatsby, Tropical, années 20..."
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quelques mots pour décrire cette ambiance *</label>
            <textarea
              value={customStyleDescription}
              onChange={(e) => setCustomStyleDescription(e.target.value)}
              placeholder="Ex. Doré, art déco, champagne, jazz live..."
              rows={3}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}
    </QuestionShell>
  );
}
