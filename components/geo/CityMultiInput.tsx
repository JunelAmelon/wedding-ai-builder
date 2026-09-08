"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

export interface CitySuggestion {
  nom: string;
  code: string;
  codeDepartement: string | null;
  codeRegion: string | null;
  nomRegion: string | null;
  codesPostaux: string[];
  lat: number | null;
  lon: number | null;
}

interface CityMultiInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Champ multi-villes avec autocomplétion.
 * L'utilisateur tape une ville, sélectionne dans la liste, et la ville est ajoutée sous forme de tag.
 * Utilisé pour les "villes d'intervention" des prestataires.
 */
export function CityMultiInput({
  values,
  onChange,
  placeholder = "Ajouter une ville...",
  className = "",
  id,
}: CityMultiInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function addCity(city: string) {
    const trimmed = city.trim();
    if (!trimmed) return;
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...values, trimmed]);
    setInput("");
    setSuggestions([]);
    setOpen(false);
  }

  function removeCity(city: string) {
    onChange(values.filter((v) => v !== city));
  }

  function fetchSuggestions(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(`/api/geo/cities?q=${encodeURIComponent(query)}&limit=6`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.cities || []);
        setOpen(true);
        setHighlightIndex(-1);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 250);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        e.preventDefault();
        addCity(suggestions[highlightIndex].nom);
      } else if (input.trim()) {
        e.preventDefault();
        addCity(input);
      }
    } else if (e.key === "Backspace" && !input && values.length > 0) {
      removeCity(values[values.length - 1]);
    } else if (e.key === "ArrowDown" && open && suggestions.length > 0) {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && open && suggestions.length > 0) {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onClick={() => setOpen(suggestions.length > 0)}
    >
      <div className="flex flex-wrap items-center gap-1.5 min-h-[48px] w-full bg-white border-2 border-[#EDEDF0] rounded-[28px] px-3 py-2 focus-within:border-[#fef2f4] transition">
        {values.map((city) => (
          <span
            key={city}
            className="inline-flex items-center gap-1 bg-[#fef2f4] text-[#0E0E10] text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {city}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeCity(city);
              }}
              className="text-[#6B6B72] hover:text-[#e64a5d] transition"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={values.length === 0 ? placeholder : ""}
          autoComplete="off"
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[#0E0E10] placeholder:text-[#6B6B72] outline-none border-none p-0"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#EDEDF0] rounded-[16px] shadow-[0_12px_40px_rgba(14,14,16,0.12)] overflow-hidden max-h-[260px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-[#6B6B72]">Recherche…</div>
          )}
          {!loading && suggestions.length === 0 && input.trim().length >= 2 && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addCity(input);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-[#0E0E10] hover:bg-[#fef2f4]/50"
            >
              Ajouter « {input.trim()} »
            </button>
          )}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={s.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addCity(s.nom);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                  i === highlightIndex ? "bg-[#fef2f4]" : "hover:bg-[#fef2f4]/50"
                }`}
              >
                <span className="font-medium text-[#0E0E10] truncate">{s.nom}</span>
                <span className="text-[11px] text-[#6B6B72] shrink-0">
                  {s.codesPostaux[0] || s.codeDepartement}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
