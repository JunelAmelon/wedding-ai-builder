export interface BudgetPageContent {
  guests: number;
  averageTotal: number;
  breakdown: { label: string; amount: number; pct: number }[];
}

export interface CityPageContent {
  city: string;
  averageCost: number;
  comparison: { city: string; averageCost: number }[];
}

export interface PlanningPageContent {
  year: number;
  milestones: { month: string; tasks: string[] }[];
}

const BASE_COST_PER_GUEST = 145; // EUR, base de calcul déterministe

const CITY_INDEX: Record<string, number> = {
  Paris: 1.45,
  Lyon: 1.1,
  Marseille: 1.0,
  Bordeaux: 1.08,
  Nice: 1.3,
  Cotonou: 0.55,
  Dakar: 0.6,
  Abidjan: 0.62,
  Bruxelles: 1.25,
  Genève: 1.7,
  Montréal: 1.15,
};

export function generateBudgetPage(guests: number): BudgetPageContent {
  const averageTotal = Math.round(guests * BASE_COST_PER_GUEST);
  const ratios = [
    { label: "Lieu de réception", pct: 35 },
    { label: "Traiteur", pct: 25 },
    { label: "Photographe", pct: 12 },
    { label: "Musique / DJ", pct: 8 },
    { label: "Décoration", pct: 10 },
    { label: "Marge imprévus", pct: 10 },
  ];
  return {
    guests,
    averageTotal,
    breakdown: ratios.map((r) => ({
      label: r.label,
      amount: Math.round((averageTotal * r.pct) / 100),
      pct: r.pct,
    })),
  };
}

export function generateCityPage(city: string): CityPageContent {
  const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  const index = CITY_INDEX[normalizedCity] ?? 1.0;
  const averageCost = Math.round(100 * BASE_COST_PER_GUEST * index);
  const comparison = Object.entries(CITY_INDEX)
    .filter(([c]) => c !== normalizedCity)
    .slice(0, 4)
    .map(([c, idx]) => ({ city: c, averageCost: Math.round(100 * BASE_COST_PER_GUEST * idx) }));
  return { city: normalizedCity, averageCost, comparison };
}

export function generatePlanningPage(year: number): PlanningPageContent {
  return {
    year,
    milestones: [
      { month: "J-12 mois", tasks: ["Fixer la date", "Définir le budget global", "Réserver le lieu"] },
      { month: "J-9 mois", tasks: ["Réserver le traiteur", "Choisir le photographe"] },
      { month: "J-6 mois", tasks: ["Envoyer les save-the-date", "Choisir la tenue"] },
      { month: "J-4 mois", tasks: ["Goûter le menu", "Finaliser la liste d'invités"] },
      { month: "J-2 mois", tasks: ["Envoyer les invitations officielles"] },
      { month: "J-1 mois", tasks: ["Confirmer le nombre final d'invités"] },
      { month: "J-jour", tasks: ["Profiter du moment !"] },
    ],
  };
}

export const SEO_GUEST_VALUES = [50, 80, 100, 150, 200, 300];
export const SEO_CITY_VALUES = Object.keys(CITY_INDEX);
export const SEO_YEAR_VALUES = [new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2];
