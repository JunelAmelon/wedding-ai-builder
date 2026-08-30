import type {
  AIOutput,
  BudgetBreakdown,
  BudgetCategoryStatus,
  CompatibilityResult,
  OmissionItem,
  Opportunity,
  ProviderInsight,
  QuizAnswers,
  RiskItem,
  RiskEngineOutput,
  Scenario,
  CoachSummary,
  ActionItem,
  Timeline,
  TimelineMilestone,
} from "@/types/domain";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function fmtCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fmtDate(iso: string | undefined): string {
  if (!iso) return "Date non précisée";
  if (iso === "not-fixed") return "Date à définir";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysUntilWedding(weddingDate: string | undefined): number | null {
  if (!weddingDate || weddingDate === "not-fixed") return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const wedding = new Date(weddingDate);
  wedding.setHours(0, 0, 0, 0);
  const diff = wedding.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function monthsUntilWedding(weddingDate: string | undefined): number | null {
  const days = daysUntilWedding(weddingDate);
  if (days === null) return null;
  return days / 30;
}

export function normalizeBudgetStatuses(
  budgetBreakdown: BudgetBreakdown
): BudgetCategoryStatus[] {
  if (budgetBreakdown.categoryStatuses && budgetBreakdown.categoryStatuses.length === 6) {
    return budgetBreakdown.categoryStatuses;
  }

  const keys = ["venue", "catering", "photography", "music", "decoration", "contingency"] as const;
  const labels: Record<string, string> = {
    venue: "Lieu de réception",
    catering: "Traiteur & boissons",
    photography: "Photo & vidéo",
    music: "Musique & animation",
    decoration: "Décoration & fleurs",
    contingency: "Provision imprévus",
  };
  const marketRates: Record<string, { rec: number; min: number; max: number }> = {
    venue: { rec: 0.36, min: 0.28, max: 0.45 },
    catering: { rec: 0.27, min: 0.22, max: 0.35 },
    photography: { rec: 0.11, min: 0.08, max: 0.16 },
    music: { rec: 0.07, min: 0.04, max: 0.12 },
    decoration: { rec: 0.09, min: 0.06, max: 0.15 },
    contingency: { rec: 0.1, min: 0.08, max: 0.12 },
  };

  const total = budgetBreakdown.totalBudget;
  return keys.map((key) => {
    const planned = budgetBreakdown.breakdown[key];
    const percentage = total > 0 ? (planned / total) * 100 : 0;
    const recommended = Math.round(total * marketRates[key].rec);
    const realisticMin = Math.round(total * marketRates[key].min);
    const realisticMax = Math.round(total * marketRates[key].max);
    const margin = planned - recommended;
    let riskLevel: BudgetCategoryStatus["riskLevel"] = "good";
    if (planned < realisticMin) riskLevel = "tight";
    else if (planned > realisticMax) riskLevel = "critical";
    else if (planned >= recommended) riskLevel = "good";
    else riskLevel = "excellent";

    return {
      key: labels[key],
      planned,
      recommended,
      realisticMin,
      realisticMax,
      percentage,
      riskLevel,
      margin,
      savingsPotential: Math.max(0, planned - realisticMax),
      overrunEstimate: Math.max(0, realisticMin - planned),
    };
  });
}

export function normalizeGlobalRiskLevel(budget: BudgetBreakdown): "good" | "tight" | "critical" {
  const level = budget.globalRiskLevel;
  if (level === "good" || level === "tight" || level === "critical") return level;
  const statuses = normalizeBudgetStatuses(budget);
  const bad = statuses.filter((s) => s.riskLevel === "tight" || s.riskLevel === "critical").length;
  if (bad === 0) return "good";
  if (bad >= 3) return "critical";
  return "tight";
}

export function computeScenarios(answers: QuizAnswers, budget: BudgetBreakdown): Scenario[] {
  const total = budget.totalBudget;
  const currency = budget.currency;
  const guests = answers.guestCount ?? 80;

  return [
    {
      id: "economy",
      name: "Scénario Économe",
      description: `Budget optimisé à ${fmtCurrency(total * 0.85, currency)} pour ${guests} invités.`,
      totalBudget: Math.round(total * 0.85),
      savings: Math.round(total * 0.15),
      advantages: [
        "Allège la pression financière",
        "Permet d'ajouter une belle lune de miel",
        "Moins de prestataires à coordonner",
      ],
      disadvantages: [
        "Menu et déco plus simples",
        "Moins de marge sur les extras",
      ],
      experienceImpact: "Chaleureux mais sobre : privilégie la convivialité à la faste.",
    },
    {
      id: "current",
      name: "Votre budget actuel",
      description: `Budget déclaré de ${fmtCurrency(total, currency)} pour ${guests} invités.`,
      totalBudget: total,
      savings: 0,
      advantages: ["Aligné avec votre vision", "Provision imprévus incluse", "Répartition équilibrée"],
      disadvantages: ["Nécessite un suivi rigoureux", "Peu de marge si dérapages"],
      experienceImpact: "La base solide pour un mariage cohérent avec vos attentes.",
    },
    {
      id: "comfort",
      name: "Scénario Confort",
      description: `Budget allégé de 10% pour sécuriser chaque poste : ${fmtCurrency(total * 1.1, currency)}.`,
      totalBudget: Math.round(total * 1.1),
      savings: Math.round(total * -0.1),
      advantages: [
        "Marge de manœuvre confortable",
        "Possibilité de prestataires premium",
        "Moins de stress sur les dépassements",
      ],
      disadvantages: [
        "Économies à planifier à l'avance",
        "Risque de surequipement",
      ],
      experienceImpact: "Expérience fluide, luxueuse sans excès, avec une vraie marge de sécurité.",
    },
    {
      id: "guests-minus",
      name: "Moins d'invités, plus de qualité",
      description: `Avec 20% d'invités en moins, le budget par invité grimpe significativement.`,
      totalBudget: Math.round(total),
      savings: 0,
      advantages: [
        "Budget par invité plus généreux",
        "Ambiance plus intimiste",
        "Choix de prestataires élargi",
      ],
      disadvantages: [
        "Moins de monde pour célébrer",
        "Arbitrages familiaux possibles",
      ],
      experienceImpact: "Intimiste et raffiné : plus de budget pour la qualité par personne.",
    },
  ];
}

export function computeOpportunities(answers: QuizAnswers, budget: BudgetBreakdown): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const statuses = normalizeBudgetStatuses(budget);
  const perGuest = answers.budget?.amount ? answers.budget.amount / Math.max(answers.guestCount ?? 1, 1) : 0;

  const overBudget = statuses.filter((s) => s.riskLevel === "critical" || s.savingsPotential > 0);
  overBudget.forEach((s) => {
    if (s.savingsPotential > 0) {
      opportunities.push({
        id: `sav-${s.key}`,
        title: `Optimiser ${s.key.toLowerCase()}`,
        description: `Votre enveloppe dépasse la fourchette réaliste : ${fmtCurrency(s.savingsPotential, budget.currency)} peuvent être récupérés sans dégrader l'expérience.`,
        estimatedSavings: s.savingsPotential,
        impact: s.savingsPotential > budget.totalBudget * 0.05 ? "high" : "medium",
      });
    }
  });

  if (answers.guestCount && answers.guestCount > 100) {
    opportunities.push({
      id: "intimiste",
      title: "Réduire la liste d'invités",
      description: `Passer sous la centaine d'invités libère du budget par personne et simplifie l'organisation.`,
      impact: "high",
    });
  }

  if (perGuest > 180) {
    opportunities.push({
      id: "per-guest",
      title: "Budget par invité confortable",
      description: "Votre budget par invité est élevé : vous pouvez viser des prestataires premium ou ajouter une expérience mémorable.",
      impact: "medium",
    });
  }

  const monthsLeft = monthsUntilWedding(answers.weddingDate);
  if (monthsLeft !== null && monthsLeft > 9) {
    opportunities.push({
      id: "early-booking",
      title: "Réserver tôt = meilleurs tarifs",
      description: "Votre délai confortable permet de négocier et d'obtenir les meilleures disponibilités.",
      impact: "medium",
    });
  }

  if (opportunities.length === 0) {
    opportunities.push({
      id: "focus-experience",
      title: "Investir dans l'expérience",
      description: "Votre budget est bien équilibré : concentrez-vous sur les 2-3 postes qui comptent le plus pour vous.",
      impact: "medium",
    });
  }

  return opportunities.slice(0, 5);
}

export function computeCompatibility(answers: QuizAnswers, budget: BudgetBreakdown): CompatibilityResult {
  const coherent: string[] = [];
  const incoherent: string[] = [];
  let score = 80;

  const perGuest = answers.budget?.amount ? answers.budget.amount / Math.max(answers.guestCount ?? 1, 1) : 0;
  const monthsLeft = monthsUntilWedding(answers.weddingDate);

  if (answers.weddingDate && monthsLeft !== null) {
    if (monthsLeft > 8) {
      coherent.push("Vous disposez d'un délai confortable pour organiser sereinement.");
      score += 5;
    } else if (monthsLeft < 4) {
      incoherent.push("Le délai restant est court par rapport aux délais des prestataires.");
      score -= 10;
    }
  }

  if (answers.guestCount && answers.guestCount > 0) {
    coherent.push(`Votre nombre d'invités (${answers.guestCount}) est un repère clair pour dimensionner le budget.`);
  }

  const statuses = normalizeBudgetStatuses(budget);
  const critical = statuses.filter((s) => s.riskLevel === "critical" || s.riskLevel === "tight");
  if (critical.length === 0) {
    coherent.push("La répartition budgétaire est équilibrée par rapport au marché.");
    score += 5;
  } else {
    incoherent.push(`${critical.length} poste(s) budgétaire(s) sont sous ou surdimensionnés par rapport au marché.`);
    score -= 5 * critical.length;
  }

  if (answers.mainPriority === "budget" && perGuest < 120) {
    incoherent.push("Votre priorité budgétaire n'est pas alignée avec un budget par invité serré.");
    score -= 10;
  } else if (answers.mainPriority === "lieu" && perGuest < 100) {
    incoherent.push("Le lieu est votre priorité, mais le budget par invité laisse peu de marge pour un beau cadre.");
    score -= 8;
  } else if (answers.mainPriority === "prestataires" && (monthsLeft ?? 12) < 6) {
    incoherent.push("Trouver les bons prestataires est votre priorité, mais le délai est court pour réserver les meilleurs.");
    score -= 5;
  } else if (answers.mainPriority === "coordination" && (answers.stressLevel ?? 5) >= 7) {
    incoherent.push("Coordonner le jour J est votre priorité avec un stress élevé : envisagez un wedding planner.");
    score -= 5;
  }

  if ((answers.stressLevel ?? 5) >= 8 && (monthsLeft ?? 12) < 6) {
    incoherent.push("Stress élevé + délai court : risque de surcharge personnelle.");
    score -= 10;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    coherent,
    incoherent,
    solutions: [
      "Réserver d'abord le lieu et le traiteur car ils dictent le reste.",
      "Revérifier la répartition budgétaire poste par poste.",
      "Identifier 3 priorités non négociables et accepter des arbitrages sur le reste.",
    ],
  };
}

type OmissionCatalogItem = {
  label: string;
  category: string;
  priority: "low" | "medium" | "high" | ((answers: QuizAnswers) => "low" | "medium" | "high");
  suggestion: string;
};

const OMISSION_CATALOG: OmissionCatalogItem[] = [
  { label: "Assurance mariage", category: "Protection", priority: "medium", suggestion: "Prévoyez une assurance annulation/responsabilité civile 3 mois avant le jour J." },
  { label: "Plan de table", category: "Logistique", priority: "low", suggestion: "Préparez un premier plan de table 2 mois avant et ajustez 1 semaine avant." },
  { label: "Animation enfants", category: "Invités", priority: (answers) => (answers.childrenCount && answers.childrenCount > 5 ? "high" : "low"), suggestion: "Prévoyez un espace ou une baby-sitter pour les enfants, surtout s'ils sont nombreux." },
  { label: "Hébergement des invités", category: "Logistique", priority: (answers) => answers.guestsFromFar ? "high" : "medium", suggestion: "Négociez un bloc de chambres d'hôtel ou listez les options proches du lieu, surtout pour les invités venant de loin." },
  { label: "Accessibilité PMR", category: "Logistique", priority: (answers) => answers.mobilityNeeds ? "high" : "low", suggestion: "Vérifiez l'accès wheelchair, les sanitaires adaptés et réservez des places près de l'allée." },
  { label: "Régimes alimentaires spécifiques", category: "Invités", priority: (answers) => answers.dietaryNeeds?.length ? "high" : "low", suggestion: "Communiquez tous les régimes et allergies au traiteur au moins 3 semaines avant le jour J." },
  { label: "Transport entre cérémonie et réception", category: "Logistique", priority: "medium", suggestion: "Prévoyez un minibus ou un plan de covoiturage si les lieux sont éloignés." },
  { label: "Cadeaux aux invités / dragées", category: "Détail", priority: "low", suggestion: "Choisissez un petit cadeau personnalisé 2 mois avant." },
  { label: "Playlist et do-not-play list", category: "Musique", priority: "medium", suggestion: "Envoyez au DJ votre ambiance souhaitée et les titres interdits 1 mois avant." },
  {
    label: "Plan B météo",
    category: "Météo",
    priority: (answers) =>
      answers.style === "rustique" || answers.style === "boheme" ? "high" : "medium",
    suggestion: "Prévoyez une tente, un barnum ou un espace intérieur de secours.",
  },
  { label: "Briefing prestataires J-7", category: "Organisation", priority: "high", suggestion: "Organisez un point de synchronisation final avec tous les prestataires." },
  { label: "Trousse d'urgence jour J", category: "Organisation", priority: "medium", suggestion: "Préparez une trousse avec scotch, aiguille, pansements, déodorant, etc." },
  { label: "Recontact des prestataires J-48", category: "Organisation", priority: "high", suggestion: "Confirmez horaires, adresses et contacts de chaque prestataire 48h avant." },
];

export function computeOmissions(answers: QuizAnswers): OmissionItem[] {
  const omitted: OmissionItem[] = [];
  let id = 1;

  OMISSION_CATALOG.forEach((item) => {
    const priority = typeof item.priority === "function" ? item.priority(answers) : item.priority;
    omitted.push({
      id: `omit-${id++}`,
      label: item.label,
      category: item.category,
      priority,
      suggestion: item.suggestion,
    });
  });

  const monthsLeft = monthsUntilWedding(answers.weddingDate);
  if (monthsLeft !== null && monthsLeft < 4) {
    omitted.push({
      id: `omit-${id++}`,
      label: "Contrat avec clause d'annulation",
      category: "Protection",
      priority: "high",
      suggestion: "Exigez des contrats avec conditions d'annulation claires compte tenu du délai court.",
    });
  }

  return omitted.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

export function computeProviderInsights(answers: QuizAnswers): ProviderInsight[] {
  const monthsLeft = monthsUntilWedding(answers.weddingDate) ?? 12;
  const highSeason = [5, 6, 7, 8, 9];
  const weddingMonth = answers.weddingDate && answers.weddingDate !== "not-fixed" ? new Date(answers.weddingDate).getMonth() : null;
  const isHighSeason = weddingMonth !== null && highSeason.includes(weddingMonth);
  const tension = isHighSeason && monthsLeft < 9 ? 9 : isHighSeason ? 7 : monthsLeft < 6 ? 6 : 4;

  const allInsights: ProviderInsight[] = [
    {
      category: "Lieu de réception",
      estimatedCount: Math.max(2, Math.min(8, Math.round((answers.guestCount ?? 80) / 20))),
      availability: monthsLeft < 6 ? "tight" : isHighSeason ? "tight" : "moderate",
      marketTension: tension,
      bookingOrder: 1,
      advice: "Réservez le lieu en premier : c'est le poste qui conditionne la date et la plupart des autres choix.",
    },
    {
      category: "Traiteur & boissons",
      estimatedCount: Math.max(2, Math.min(6, Math.round((answers.guestCount ?? 80) / 25))),
      availability: isHighSeason ? "tight" : "moderate",
      marketTension: tension,
      bookingOrder: 2,
      advice: `Le traiteur représente 25-35% du budget : sécurisez-le juste après le lieu.${answers.dietaryNeeds?.length ? " Pensez à mentionner les régimes spécifiques dès le premier contact." : ""}`,
    },
    {
      category: "Photo & vidéo",
      estimatedCount: Math.max(2, Math.min(5, 3)),
      availability: monthsLeft < 8 ? "tight" : "moderate",
      marketTension: Math.min(10, tension + 1),
      bookingOrder: 3,
      advice: "Les bons photographes sont réservés 8 à 12 mois à l'avance en saison haute.",
    },
    {
      category: "Musique & DJ",
      estimatedCount: Math.max(2, Math.min(4, 3)),
      availability: monthsLeft < 3 ? "tight" : "good",
      marketTension: Math.max(3, tension - 2),
      bookingOrder: 4,
      advice: "Vous avez plus de choix pour la musique, mais un DJ populaire doit être contacté tôt.",
    },
    {
      category: "Fleurs & décoration",
      estimatedCount: Math.max(2, Math.min(4, 3)),
      availability: monthsLeft < 2 ? "tight" : "good",
      marketTension: Math.max(3, tension - 1),
      bookingOrder: 5,
      advice: "La déco peut être ajustée tardivement, mais les fleurs de saison coûtent moins cher et sont plus fraîches.",
    },
    {
      category: "Coiffure & maquillage",
      estimatedCount: Math.max(2, Math.min(4, 3)),
      availability: monthsLeft < 4 ? "tight" : "moderate",
      marketTension: Math.max(3, tension - 1),
      bookingOrder: 6,
      advice: "Réservez un essai coiffure/maquillage 2 mois avant et confirmez le timing du jour J.",
    },
    {
      category: "Hébergement invités",
      estimatedCount: Math.max(1, Math.min(3, 2)),
      availability: monthsLeft < 4 ? "tight" : "moderate",
      marketTension: Math.max(3, tension - 2),
      bookingOrder: 7,
      advice: answers.guestsFromFar ? "Des invités viennent de loin : réservez un bloc de chambres dès maintenant." : "Comparez les hôtels proches du lieu et négociez un tarif de groupe.",
    },
  ];

  // Filter insights based on desired categories if specified
  if (answers.desiredCategories?.length) {
    const catMap: Record<string, string> = {
      "lieu": "Lieu de réception",
      "traiteur": "Traiteur & boissons",
      "photographe": "Photo & vidéo",
      "videaste": "Photo & vidéo",
      "dj": "Musique & DJ",
      "animation": "Musique & DJ",
      "fleuriste": "Fleurs & décoration",
      "decoration": "Fleurs & décoration",
      "coiffeuse-maquilleuse": "Coiffure & maquillage",
      "hebergement": "Hébergement invités",
    };
    const activeLabels = new Set(answers.desiredCategories.map(c => catMap[c]).filter(Boolean));
    return allInsights.filter(i => activeLabels.has(i.category));
  }

  return allInsights.slice(0, 5);
}

export function computeCoachSummary(answers: QuizAnswers, aiOutput: AIOutput): CoachSummary {
  const budget = aiOutput.budgetBreakdown;
  const riskScore = aiOutput.riskScore;
  const monthsLeft = monthsUntilWedding(answers.weddingDate);
  const perGuest = answers.budget?.amount ? answers.budget.amount / Math.max(answers.guestCount ?? 1, 1) : 0;

  const topDecisions: ActionItem[] = [
    { label: "Réserver le lieu de réception", priority: "high" },
    { label: "Sécuriser le traiteur", priority: "high" },
    { label: "Choisir photographe et vidéaste", priority: "high" },
    { label: "Valider la liste d'invités", priority: "medium" },
  ];

  if (answers.dietaryNeeds?.length) {
    topDecisions.push({ label: "Communiquer les régimes alimentaires au traiteur", priority: "high" });
  }
  if (answers.guestsFromFar) {
    topDecisions.push({ label: "Réserver un bloc d'hébergement pour les invités de loin", priority: "medium" });
  }
  if (answers.mobilityNeeds) {
    topDecisions.push({ label: "Vérifier l'accessibilité PMR du lieu", priority: "medium" });
  }

  if (riskScore > 60) {
    topDecisions.unshift({ label: "Faire un point complet sur le budget et les délais", priority: "high" });
  }

  if ((answers.stressLevel ?? 0) >= 8) {
    topDecisions.push({ label: "Désigner un proche ou wedding planner référent", priority: "high" });
  }

  const preparationLevel = Math.max(
    1,
    Math.min(10, Math.round(10 - (riskScore / 100) * 5 - (monthsLeft !== null && monthsLeft < 4 ? 1.5 : 0)))
  );

  const absolutePriorities = ["Sécuriser le lieu et le traiteur en priorité", "Tenir une liste d'invités actualisée"];
  if (riskScore > 50) absolutePriorities.unshift("Réduire le risque global avant d'ajouter des extras");
  if (perGuest < 100) absolutePriorities.push("Optimiser les postes les plus coûteux sans sacrifier l'essentiel");

  const savingsOpportunities = computeOpportunities(answers, budget)
    .slice(0, 3)
    .map((o) => o.title);

  if (savingsOpportunities.length === 0) {
    savingsOpportunities.push("Privilégier les forfaits traiteur en semaine ou hors saison");
  }

  const mistakes = aiOutput.blueprint.mistakesToAvoid?.slice(0, 3) ?? [
    "Négliger les détails logistiques à la faveur de la déco",
    "Réserver les prestataires dans le désordre",
    "Sous-estimer les extras et taxes",
  ];

  let reassurance = "Votre projet est sur une bonne dynamique. En suivant les priorités identifiées, vous pouvez avancer sereinement.";
  if (riskScore < 35) reassurance = "Excellent départ : votre projet est bien calibré. Concentrez-vous sur la qualité des moments forts.";
  else if (riskScore > 70) reassurance = "Le projet présente des tensions, mais elles sont toutes gérables avec une action rapide et ciblée.";

  return {
    preparationLevel,
    topDecisions: topDecisions.slice(0, 5),
    mistakesToAvoid: mistakes,
    absolutePriorities,
    savingsOpportunities,
    reassurance,
  };
}

export function normalizeRisks(riskEngine: RiskEngineOutput): RiskItem[] {
  if (riskEngine.risks && riskEngine.risks.length > 0) return riskEngine.risks;

  const items: RiskItem[] = [];
  riskEngine.criticalErrors.forEach((text: string, i: number) => {
    items.push({
      id: `critical-${i + 1}`,
      category: "organizational",
      title: text.split(".")[0].slice(0, 40) || "Erreur critique",
      description: text,
      severity: 9,
      probability: 7,
      impact: 9,
      solution: "Traiter en priorité absolue dès les prochains jours.",
      priority: 10,
    });
  });
  riskEngine.budgetInconsistencies.forEach((text: string, i: number) => {
    items.push({
      id: `budget-${i + 1}`,
      category: "budget",
      title: "Incohérence budgétaire",
      description: text,
      severity: 7,
      probability: 8,
      impact: 7,
      solution: "Revoyez la répartition et prévoyez un arbitrage avec votre prestataire.",
      priority: 8,
    });
  });
  riskEngine.organizationalRisks.forEach((text: string, i: number) => {
    items.push({
      id: `org-${i + 1}`,
      category: "organizational",
      title: text.split(".")[0].slice(0, 40) || "Risque organisationnel",
      description: text,
      severity: 6,
      probability: 7,
      impact: 6,
      solution: "Intégrez cette surveillance à votre prochain point d'avancement.",
      priority: 6,
    });
  });
  return items;
}

export function riskLevelColor(level: BudgetCategoryStatus["riskLevel"]): string {
  switch (level) {
    case "excellent":
      return "#22C55E";
    case "good":
      return "#7C3AED";
    case "tight":
      return "#F59E0B";
    case "critical":
      return "#EF4444";
    default:
      return "#7C3AED";
  }
}

export function formatDateFr(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function daysUntil(from: Date, to: Date): number {
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function normalizeMilestones(
  timeline: Timeline,
  weddingDate: Date | null
): TimelineMilestone[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const wedding = weddingDate ? new Date(weddingDate) : null;
  if (wedding) wedding.setHours(0, 0, 0, 0);

  return timeline.milestones.map((m: TimelineMilestone) => {
    const months = typeof m.monthsBeforeWedding === "number" ? m.monthsBeforeWedding : 0;
    let date: Date | null = null;
    if (m.idealDeadline) {
      const d = new Date(m.idealDeadline);
      if (!isNaN(d.getTime())) date = d;
    } else if (wedding) {
      const d = new Date(wedding);
      d.setMonth(d.getMonth() - months);
      date = d;
    }

    let status: TimelineMilestone["status"] = m.status;
    if (!status) {
      if (date && date < now) status = "completed";
      else status = "upcoming";
    }

    const urgencyMap: Record<string, TimelineMilestone["urgency"]> = {
      critical: "urgent",
      high: "urgent",
      medium: "soon",
      low: "early",
      early: "early",
      soon: "soon",
      urgent: "urgent",
      late: "late",
    };
    const urgency = m.urgency ? urgencyMap[m.urgency] ?? m.urgency : "soon";

    const displayDate = m.displayDate ?? (date ? fmtDate(date.toISOString()) : `${months} mois avant`);

    return {
      ...m,
      monthsBeforeWedding: months,
      status,
      urgency,
      displayDate,
      idealDeadline: date ? date.toISOString() : m.idealDeadline,
    };
  });
}

export function riskScoreColor(score: number): string {
  if (score <= 30) return "#22C55E";
  if (score <= 55) return "#7C3AED";
  if (score <= 75) return "#F59E0B";
  return "#EF4444";
}

export function riskScoreLabel(score: number): string {
  if (score <= 30) return "Faible";
  if (score <= 55) return "Modéré";
  if (score <= 75) return "Élevé";
  return "Critique";
}
