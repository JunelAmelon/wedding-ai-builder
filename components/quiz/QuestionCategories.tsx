"use client";

import { useState, useMemo } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { CATEGORY_OPTIONS, VENDOR_CATEGORY_GROUPS } from "@/lib/constants";
import type { DesiredCategory } from "@/types/domain";
import { Search, X, Check } from "lucide-react";

export interface CategoriesAnswer {
  desiredCategories: DesiredCategory[];
}

interface QuestionCategoriesProps {
  onAnswer: (value: CategoriesAnswer) => void;
}

export function QuestionCategories({ onAnswer }: QuestionCategoriesProps) {
  const [selected, setSelected] = useState<Set<DesiredCategory>>(new Set());
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  function toggle(cat: DesiredCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const filteredOptions = useMemo(() => {
    let list = CATEGORY_OPTIONS;
    if (activeGroup !== "all") {
      const group = VENDOR_CATEGORY_GROUPS.find((g) => g.id === activeGroup);
      if (group) {
        const allowed = new Set(group.categories.map((c) => c.value));
        list = list.filter((opt) => allowed.has(opt.value));
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((opt) => opt.label.toLowerCase().includes(q));
    }
    return list;
  }, [activeGroup, search]);

  return (
    <QuestionShell
      title="De quels prestataires avez-vous besoin ?"
      subtitle="Sélectionnez tout ce dont vous avez besoin. On vous trouvera les meilleurs dans chaque catégorie."
      onNext={() => onAnswer({ desiredCategories: Array.from(selected) })}
      nextDisabled={selected.size === 0}
    >
      {/* Barre de contrôle : Recherche et Thématiques */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une spécialité... (ex: Château, Robe, Photo)"
              className="w-full h-9 pl-9 pr-8 text-[13px] rounded-full border border-[#EDEDF0] bg-white text-[#0E0E10] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#0E0E10] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#0E0E10]"
              >
                <X size={13} />
              </button>
            )}
          </div>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="h-9 px-3 rounded-full border border-[#EDEDF0] bg-white text-[11.5px] font-medium text-[#6B6B72] hover:text-[#c43a4a] hover:border-[#c43a4a]/30 transition-colors shrink-0"
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Pilules de filtres thématiques */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
          <button
            type="button"
            onClick={() => {
              setActiveGroup("all");
              setSearch("");
            }}
            className={`h-7 px-3 rounded-full text-[12px] font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
              activeGroup === "all" && !search
                ? "bg-[#0E0E10] text-white shadow-sm"
                : "bg-white text-[#6B6B72] border border-[#EDEDF0] hover:text-[#0E0E10]"
            }`}
          >
            <span>✨</span>
            <span>Tous (35)</span>
          </button>
          {VENDOR_CATEGORY_GROUPS.map((group) => {
            const isSelected = activeGroup === group.id && !search;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveGroup(group.id);
                  setSearch("");
                }}
                className={`h-7 px-3 rounded-full text-[12px] font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? "bg-[#0E0E10] text-white shadow-sm"
                    : "bg-white text-[#6B6B72] border border-[#EDEDF0] hover:text-[#0E0E10]"
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des catégories filtrées */}
      {filteredOptions.length === 0 ? (
        <div className="py-8 text-center bg-white rounded-[20px] border border-[#EDEDF0]">
          <p className="text-sm text-[#6B6B72]">
            Aucune spécialité ne correspond à « {search} ».
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-2 text-xs text-[#c43a4a] hover:underline font-medium"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredOptions.map((opt) => {
            const isSelected = selected.has(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                type="button"
                className={
                  "relative flex items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition-all " +
                  (isSelected
                    ? "border-[#0E0E10] bg-[#E4DBFB] shadow-sm font-semibold"
                    : "border-[#EDEDF0] bg-white hover:border-[#0E0E10]/30 hover:bg-[#E4DBFB]/20")
                }
              >
                <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                <span className="text-[13px] text-[#0E0E10] leading-snug flex-1 min-w-0">
                  {opt.label}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-[#0E0E10] text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Compteur de sélection sous la grille */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#6B6B72] px-1">
        <span>
          {selected.size === 0
            ? "Sélectionnez au moins un prestataire pour continuer."
            : `${selected.size} prestataire${selected.size > 1 ? "s" : ""} sélectionné${selected.size > 1 ? "s" : ""}`}
        </span>
        {selected.size > 0 && (
          <span className="font-semibold text-[#0E0E10]">
            Prêt à continuer →
          </span>
        )}
      </div>
    </QuestionShell>
  );
}
