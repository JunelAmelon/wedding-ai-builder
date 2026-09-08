"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";
import { CityAutocomplete } from "@/components/geo/CityAutocomplete";

export function QuestionLocation({
  onAnswer,
}: {
  onAnswer: (value: { city: string; country: string }) => void;
}) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const COUNTRY_SUGGESTIONS = [
    "France",
    "Belgique",
    "Suisse",
    "Luxembourg",
    "Canada",
    "Bénin",
    "Côte d'Ivoire",
    "Sénégal",
    "Togo",
    "Maroc",
  ];

  return (
    <QuestionShell
      title="Où aura lieu le mariage ?"
      subtitle="Ville + pays suffisent."
      onNext={() => onAnswer({ city, country })}
      nextDisabled={!city || !country}
    >
      <div className="space-y-3">
        <CityAutocomplete
          value={city}
          onChange={setCity}
          placeholder="Ville"
          className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#E4DBFB] transition"
        />

        <input
          list="country-suggestions"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Pays"
          className="w-full rounded-[28px] bg-white border-2 border-[#EDEDF0] px-4 py-3.5 text-[#0E0E10] placeholder:text-[#6B6B72] focus:outline-none focus:border-[#E4DBFB] transition"
        />
        <datalist id="country-suggestions">
          {COUNTRY_SUGGESTIONS.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </div>
    </QuestionShell>
  );
}
