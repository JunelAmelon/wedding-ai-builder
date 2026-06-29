"use client";

import { useState } from "react";
import Image from "next/image";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { STYLE_OPTIONS } from "@/lib/constants";
import type { WeddingStyle } from "@/types/domain";

export function QuestionStyle({ onAnswer }: { onAnswer: (value: WeddingStyle) => void }) {
  const [style, setStyle] = useState<WeddingStyle | null>(null);

  return (
    <QuestionShell
      title="Quel style vous inspire le plus ?"
      subtitle="Choisis l'ambiance dominante."
      onNext={() => style && onAnswer(style)}
      nextDisabled={!style}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStyle(opt.value)}
            className={
              "group rounded-2xl border text-left transition overflow-hidden bg-white shadow-[0_10px_30px_rgba(11,15,26,0.05)] " +
              (style === opt.value
                ? "border-primary ring-2 ring-primary/20"
                : "border-black/10 hover:border-black/20")
            }
            type="button"
          >
            <div className="relative h-28">
              <Image
                src={opt.imageUrl}
                alt={opt.label}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white font-semibold tracking-tight">{opt.label}</div>
                <div className="text-white/80 text-xs mt-0.5">
                  {style === opt.value ? "Sélectionné" : "Choisir ce style"}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </QuestionShell>
  );
}
