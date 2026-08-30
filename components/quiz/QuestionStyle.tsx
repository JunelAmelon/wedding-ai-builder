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
import type { WeddingStyle, Ambiance } from "@/types/domain";
import { AMBIANCE_OPTIONS } from "@/lib/constants";

export interface StyleAnswer {
  style: WeddingStyle;
  customStyle?: string;
  customStyleDescription?: string;
  ambiance?: Ambiance[];
}

interface QuestionStyleProps {
  onAnswer: (value: StyleAnswer) => void;
}

export function QuestionStyle({ onAnswer }: QuestionStyleProps) {
  const [style, setStyle] = useState<WeddingStyle | null>(null);
  const [customStyle, setCustomStyle] = useState("");
  const [customStyleDescription, setCustomStyleDescription] = useState("");
  const [ambiance, setAmbiance] = useState<Set<Ambiance>>(new Set());

  function toggleAmbiance(a: Ambiance) {
    setAmbiance((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  const options: {
    value: WeddingStyle;
    label: string;
    icon: LucideIcon;
    bg: string;
    iconColor: string;
    text: string;
  }[] = [
    { value: "boheme", label: "Bohème", icon: Leaf, bg: "#E4DBFB", iconColor: "#7c6bc7", text: "#0E0E10" },
    { value: "classique", label: "Classique", icon: Crown, bg: "#F4D93E", iconColor: "#0E0E10", text: "#0E0E10" },
    { value: "moderne", label: "Moderne", icon: Sparkles, bg: "#E8E8C0", iconColor: "#6B6B72", text: "#0E0E10" },
    { value: "destination", label: "Destination", icon: Plane, bg: "#D6EAF8", iconColor: "#2c6faa", text: "#0E0E10" },
    { value: "rustique", label: "Rustique", icon: Trees, bg: "#F0E6D2", iconColor: "#8a6d3b", text: "#0E0E10" },
    { value: "luxe", label: "Luxe", icon: Gem, bg: "#6B6B72", iconColor: "#fff", text: "#fff" },
    { value: "autre", label: "Autre", icon: PenTool, bg: "#EDE8E0", iconColor: "#6B6B72", text: "#0E0E10" },
  ];

  const isOther = style === "autre";
  const canProceed = style && (!isOther || (customStyle.trim() && customStyleDescription.trim()));

  return (
    <QuestionShell
      title="Quel style vous inspire le plus ?"
      subtitle="Choisis l'ambiance dominante, puis les mots qui te correspondent."
      onNext={() => {
        if (!style) return;
        if (isOther) {
          onAnswer({ style, customStyle: customStyle.trim(), customStyleDescription: customStyleDescription.trim(), ambiance: Array.from(ambiance) });
        } else {
          onAnswer({ style, ambiance: Array.from(ambiance) });
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
        <div className="mt-6 space-y-4 rounded-[28px] border border-[#EDEDF0] bg-[#fef2f4]/50 p-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Votre thème *</label>
            <input
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Ex. Gatsby, Tropical, années 20..."
              className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4] transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Quelques mots pour décrire cette ambiance *</label>
            <textarea
              value={customStyleDescription}
              onChange={(e) => setCustomStyleDescription(e.target.value)}
              placeholder="Ex. Doré, art déco, champagne, jazz live..."
              rows={3}
              className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#fef2f4] transition"
            />
          </div>
        </div>
      )}

      {style && !isOther && (
        <div className="mt-6">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B72] mb-3">
            Quels mots décrivent le mieux votre ambiance ?
          </label>
          <div className="flex flex-wrap gap-2">
            {AMBIANCE_OPTIONS.map((opt) => {
              const isSelected = ambiance.has(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleAmbiance(opt.value)}
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
        </div>
      )}
    </QuestionShell>
  );
}
