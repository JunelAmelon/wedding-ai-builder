"use client";

import { useEffect, useRef, useState } from "react";

interface RegionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

const FALLBACK_REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
];

/**
 * Champ d'autocomplétion de région française.
 * La liste est chargée depuis /api/geo/regions (statique) avec un fallback local.
 */
export function RegionAutocomplete({
  value,
  onChange,
  placeholder = "Île-de-France, Nouvelle-Aquitaine, ...",
  className = "",
  id,
  name,
}: RegionAutocompleteProps) {
  const [regions, setRegions] = useState<string[]>(FALLBACK_REGIONS);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/geo/regions")
      .then((r) => r.json())
      .then((data) => {
        if (data.regions?.length) setRegions(data.regions);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = regions.filter((r) =>
    r.toLowerCase().includes(value.toLowerCase())
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      onChange(filtered[highlightIndex]);
      setOpen(false);
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
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlightIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#EDEDF0] rounded-[16px] shadow-[0_12px_40px_rgba(14,14,16,0.12)] overflow-hidden max-h-[220px] overflow-y-auto">
          {filtered.map((r, i) => (
            <button
              key={r}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(r);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                i === highlightIndex ? "bg-[#fef2f4]" : "hover:bg-[#fef2f4]/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
