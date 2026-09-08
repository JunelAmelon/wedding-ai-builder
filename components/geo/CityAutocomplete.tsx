"use client";

import { useEffect, useRef, useState } from "react";

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

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: CitySuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  /** Si true, passe aussi le code postal du premier code postal de la ville sélectionnée */
  onPostalCode?: (codePostal: string) => void;
  /** Si true, passe aussi le nom de la région de la ville sélectionnée */
  onRegion?: (region: string) => void;
}

/**
 * Champ d'autocomplétion de ville française basé sur l'API Géo (api.gouv.fr/geo).
 * Affiche une liste déroulante de suggestions en temps réel (debounce 250 ms).
 */
export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Ville",
  className = "",
  id,
  name,
  required,
  onPostalCode,
  onRegion,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const interactedRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
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
        const res = await fetch(`/api/geo/cities?q=${encodeURIComponent(value)}&limit=8`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.cities || []);
        if (interactedRef.current) setOpen(true);
        setHighlightIndex(-1);
      } catch {
        // ignore abort errors
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function selectSuggestion(s: CitySuggestion) {
    onChange(s.nom, s);
    if (onPostalCode && s.codesPostaux[0]) onPostalCode(s.codesPostaux[0]);
    if (onRegion && s.nomRegion) onRegion(s.nomRegion);
    setOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        required={required}
        onChange={(e) => {
          interactedRef.current = true;
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          interactedRef.current = true;
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#EDEDF0] rounded-[16px] shadow-[0_12px_40px_rgba(14,14,16,0.12)] overflow-hidden max-h-[260px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-[#6B6B72]">Recherche…</div>
          )}
          {!loading && suggestions.length === 0 && value.trim().length >= 2 && (
            <div className="px-4 py-3 text-sm text-[#6B6B72]">Aucune ville trouvée</div>
          )}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={s.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                  i === highlightIndex ? "bg-[#fef2f4]" : "hover:bg-[#fef2f4]/50"
                }`}
              >
                <span className="font-medium text-[#0E0E10] truncate">{s.nom}</span>
                <span className="text-[11px] text-[#6B6B72] shrink-0">
                  {s.codesPostaux[0] || s.codeDepartement}
                  {s.nomRegion ? ` · ${s.nomRegion}` : ""}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
