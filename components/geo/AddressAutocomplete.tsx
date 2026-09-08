"use client";

import { useEffect, useRef, useState } from "react";

export interface AddressSuggestion {
  label: string;
  name: string;
  postcode: string;
  citycode: string;
  city: string;
  context: string;
  lat: number | null;
  lon: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, suggestion?: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  /** Renseigne la ville extraite de l'adresse sélectionnée */
  onCity?: (city: string) => void;
  /** Renseigne le code postal extrait de l'adresse sélectionnée */
  onPostalCode?: (codePostal: string) => void;
}

/**
 * Champ d'autocomplétion d'adresse complète basé sur l'API Adresse (api-adresse.data.gouv.fr).
 * Permet de saisir "12 rue de la Paix Paris" et de sélectionner une adresse précise
 * avec rue, code postal, ville et coordonnées GPS.
 */
export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "12 rue de la Paix, 75002 Paris",
  className = "",
  id,
  name,
  required,
  onCity,
  onPostalCode,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
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
    if (value.trim().length < 3) {
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
        const res = await fetch(`/api/geo/address?q=${encodeURIComponent(value)}&limit=6`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.addresses || []);
        if (interactedRef.current) setOpen(true);
        setHighlightIndex(-1);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  function selectSuggestion(s: AddressSuggestion) {
    onChange(s.label, s);
    if (onCity) onCity(s.city);
    if (onPostalCode) onPostalCode(s.postcode);
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
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#EDEDF0] rounded-[16px] shadow-[0_12px_40px_rgba(14,14,16,0.12)] overflow-hidden max-h-[280px] overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-[#6B6B72]">Recherche…</div>
          )}
          {!loading && suggestions.length === 0 && value.trim().length >= 3 && (
            <div className="px-4 py-3 text-sm text-[#6B6B72]">Aucune adresse trouvée</div>
          )}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={`${s.citycode}-${i}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  i === highlightIndex ? "bg-[#fef2f4]" : "hover:bg-[#fef2f4]/50"
                }`}
              >
                <div className="font-medium text-[#0E0E10] truncate">{s.name}</div>
                <div className="text-[11px] text-[#6B6B72] truncate">
                  {s.postcode} {s.city} — {s.context}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
