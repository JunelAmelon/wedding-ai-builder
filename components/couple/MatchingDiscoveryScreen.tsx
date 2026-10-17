"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Heart, CheckCircle2 } from "lucide-react";

interface MatchingDiscoveryScreenProps {
  onComplete?: () => void;
}

const DISCOVERY_STEPS = [
  "Analyse de vos préférences et de votre style...",
  "Exploration des prestataires qualifiés dans votre région...",
  "Calcul des disponibilités et des correspondances budgétaires...",
  "Sélection des meilleurs profils sur-mesure...",
];

export default function MatchingDiscoveryScreen({ onComplete }: MatchingDiscoveryScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < DISCOVERY_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[85dvh] bg-gradient-to-b from-[#fef2f4] via-white to-white flex flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in duration-500">
      <div className="relative mb-8">
        {/* Cercles de pulsation doux */}
        <div className="absolute -inset-4 rounded-full bg-[#fecdd3]/40 animate-ping opacity-60" />
        <div className="absolute -inset-2 rounded-full bg-[#fecdd3]/60 blur-xs" />
        <div className="relative h-20 w-20 rounded-full bg-white border border-[#fecdd3] shadow-xl flex items-center justify-center text-[#e64a5d]">
          <Sparkles size={36} className="animate-spin text-[#e64a5d]" style={{ animationDuration: "6s" }} />
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f4] border border-[#fecdd3] text-[#e64a5d] text-xs font-semibold uppercase tracking-wider">
          <Heart size={12} className="fill-[#e64a5d]" />
          Assistant Intelligent
        </div>

        <h1 className="font-allura text-3xl sm:text-4xl text-[#0E0E10] font-normal tracking-tight">
          Recherche de vos prestataires idéaux
        </h1>

        <p className="text-[#6B6B72] text-sm sm:text-base leading-relaxed h-12 flex items-center justify-center transition-all duration-300">
          {DISCOVERY_STEPS[stepIndex]}
        </p>

        {/* Barre de progression fluide */}
        <div className="w-full bg-[#EDEDF0] h-1.5 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-[#e64a5d] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((stepIndex + 1) / DISCOVERY_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Petits indicateurs d'étapes */}
        <div className="flex justify-center items-center gap-2 pt-4">
          {DISCOVERY_STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === stepIndex
                  ? "w-6 bg-[#e64a5d]"
                  : idx < stepIndex
                  ? "w-2 bg-[#3C8552]"
                  : "w-2 bg-[#EDEDF0]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
