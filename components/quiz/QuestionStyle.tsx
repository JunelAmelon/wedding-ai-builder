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

  const options: {
    value: WeddingStyle;
    label: string;
    icon: LucideIcon;
    bg: string;
    iconColor: string;
    text: string;
  }[] = [
    { value: "boheme", label: "Bohème", icon: Leaf, bg: "#D8ECD9", iconColor: "#3C8552", text: "#0E0E10" },
    { value: "classique", label: "Classique", icon: Crown, bg: "#FBE1E6", iconColor: "#8C2F39", text: "#0E0E10" },
    { value: "moderne", label: "Moderne", icon: Sparkles, bg: "#E4DBFB", iconColor: "#8B7BD8", text: "#0E0E10" },
    { value: "destination", label: "Destination", icon: Plane, bg: "#F4D93E", iconColor: "#0E0E10", text: "#0E0E10" },
    { value: "rustique", label: "Rustique", icon: Trees, bg: "#e64a5d", iconColor: "#fff", text: "#fff" },
    { value: "luxe", label: "Luxe", icon: Gem, bg: "#8B7BD8", iconColor: "#fff", text: "#fff" },
    { value: "autre", label: "Autre", icon: PenTool, bg: "#F7F7F9", iconColor: "#6B6B72", text: "#0E0E10" },
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = style === opt.value;

          return (
            <button
              key={opt.value}
              onClick={() => setStyle(opt.value)}
              type="button"
              className="rounded-none border border-ink/10 px-3 py-4 text-left transition hover:opacity-95"
              style={{
                backgroundColor: opt.bg,
                color: opt.text,
                boxShadow: selected ? `inset 0 0 0 2px ${opt.text}` : "0 12px 40px rgba(11,15,26,0.05)",
              }}
            >
              <div
                className="h-10 w-10 mb-3 flex items-center justify-center rounded-none"
                style={{ backgroundColor: selected ? (opt.text === "#fff" ? "rgba(14,14,16,0.25)" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.55)" }}
              >
                <Icon size={20} color={selected ? opt.text : opt.iconColor} />
              </div>
              <div className="font-semibold leading-tight text-sm" style={{ color: opt.text }}>
                {opt.label}
              </div>
              <div className="text-[11px] mt-1 opacity-75" style={{ color: opt.text }}>
                {selected ? "Sélectionné" : "Choisir"}
              </div>
            </button>
          );
        })}
      </div>

      {isOther && (
        <div className="mt-6 space-y-4 rounded-r-lg border border-line bg-surface p-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Votre thème *</label>
            <input
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Ex. Gatsby, Tropical, années 20..."
              className="w-full rounded-r-md bg-white border border-line px-4 py-3 text-text-primary placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30 focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quelques mots pour décrire cette ambiance *</label>
            <textarea
              value={customStyleDescription}
              onChange={(e) => setCustomStyleDescription(e.target.value)}
              placeholder="Ex. Doré, art déco, champagne, jazz live..."
              rows={3}
              className="w-full rounded-r-md bg-white border border-line px-4 py-3 text-text-primary placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/30 focus:bg-white transition"
            />
          </div>
        </div>
      )}
    </QuestionShell>
  );
}
