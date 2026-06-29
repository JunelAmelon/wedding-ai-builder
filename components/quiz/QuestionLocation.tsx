"use client";

import { useState } from "react";
import { QuestionShell } from "@/components/quiz/QuestionShell";

export function QuestionLocation({
  onAnswer,
}: {
  onAnswer: (value: { city: string; country: string }) => void;
}) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const CITY_SUGGESTIONS = [
    "Paris",
    "Lyon",
    "Marseille",
    "Toulouse",
    "Nice",
    "Bordeaux",
    "Nantes",
    "Lille",
    "Strasbourg",
    "Montpellier",
    "Genève",
    "Lausanne",
    "Bruxelles",
    "Luxembourg",
    "Montréal",
    "Abidjan",
    "Dakar",
    "Cotonou",
    "Porto-Novo",
    "Lomé",
    "Marrakech",
    "Casablanca",
  ];

  const COUNTRY_SUGGESTIONS = [
    "France",
    "Belgique",
    "Suisse",
    "Luxembourg",
    "Canada",
    "Bénin",
    "Côte d’Ivoire",
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
        <input
          list="city-suggestions"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ville"
          className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <datalist id="city-suggestions">
          {CITY_SUGGESTIONS.map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>

        <input
          list="country-suggestions"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Pays"
          className="w-full rounded-xl bg-white border border-black/10 px-4 py-4 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
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
