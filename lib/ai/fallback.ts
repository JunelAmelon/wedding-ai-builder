import type {
  QuizAnswers,
  WeddingBlueprint,
  BudgetBreakdown,
  BudgetCategoryStatus,
  Timeline,
  RiskEngineOutput,
  RiskItem,
} from "@/types/domain";

const STYLE_LABELS: Record<string, string> = {
  boheme: "Bohème",
  classique: "Classique & élégant",
  moderne: "Moderne & minimaliste",
  destination: "Destination Wedding",
  rustique: "Rustique & champêtre",
  luxe: "Luxe & raffiné",
  autre: "Thème personnalisé",
};

function normalizeStyle(answers: QuizAnswers): { style: string | undefined; customStyle?: string; customStyleDescription?: string } {
  const styleAny = answers.style as unknown;
  if (typeof styleAny === "object" && styleAny !== null) {
    const s = styleAny as Record<string, string>;
    return {
      style: s.style ?? undefined,
      customStyle: s.customStyle ?? answers.customStyle,
      customStyleDescription: s.customStyleDescription ?? answers.customStyleDescription,
    };
  }
  return {
    style: styleAny as string | undefined,
    customStyle: answers.customStyle,
    customStyleDescription: answers.customStyleDescription,
  };
}

function getStyleLabel(answers: QuizAnswers): string {
  const { style, customStyle, customStyleDescription } = normalizeStyle(answers);
  if (style === "autre" && customStyle) {
    return `${customStyle}${customStyleDescription ? ` - ${customStyleDescription}` : ""}`;
  }
  return STYLE_LABELS[style ?? "classique"] ?? "Élégant intemporel";
}

function getReformulatedStyle(answers: QuizAnswers): string {
  const { style, customStyle, customStyleDescription } = normalizeStyle(answers);
  if (style === "autre" && customStyle) {
    const combined = `${customStyle}${customStyleDescription ? ` — ${customStyleDescription}` : ""}`;
    return combined.charAt(0).toUpperCase() + combined.slice(1);
  }
  return STYLE_LABELS[style ?? "classique"] ?? "Élégant intemporel";
}

function getStyleLevels(answers: QuizAnswers): { elegance: number; conviviality: number; modernity: number; tradition: number } {
  const style = answers.style ?? "classique";
  const defaults: Record<string, { elegance: number; conviviality: number; modernity: number; tradition: number }> = {
    boheme: { elegance: 6, conviviality: 9, modernity: 5, tradition: 3 },
    classique: { elegance: 9, conviviality: 7, modernity: 3, tradition: 8 },
    moderne: { elegance: 7, conviviality: 6, modernity: 9, tradition: 2 },
    destination: { elegance: 8, conviviality: 8, modernity: 6, tradition: 4 },
    rustique: { elegance: 5, conviviality: 9, modernity: 3, tradition: 7 },
    luxe: { elegance: 10, conviviality: 6, modernity: 7, tradition: 6 },
    autre: { elegance: 7, conviviality: 7, modernity: 6, tradition: 5 },
  };
  return defaults[style ?? "classique"] ?? defaults.classique;
}

function getPalette(style: string) {
  const palettes: Record<string, { name: string; hex: string }[]> = {
    boheme: [
      { name: "Ivoire", hex: "#F5F1EB" },
      { name: "Terracotta", hex: "#C67B5C" },
      { name: "Vert olive", hex: "#7A846B" },
      { name: "Moutarde", hex: "#C9A35C" },
    ],
    classique: [
      { name: "Blanc cassé", hex: "#F8F6F0" },
      { name: "Bordeaux profond", hex: "#7C2D3A" },
      { name: "Or doux", hex: "#C9A35C" },
      { name: "Vert sauge", hex: "#8A9A7E" },
    ],
    moderne: [
      { name: "Blanc", hex: "#FFFFFF" },
      { name: "Anthracite", hex: "#3E3E3E" },
      { name: "Grège", hex: "#B8B0A8" },
      { name: "Bleu ardoise", hex: "#536878" },
    ],
    destination: [
      { name: "Sable", hex: "#E6DCC4" },
      { name: "Bleu azur", hex: "#4A90A4" },
      { name: "Corail", hex: "#D4756B" },
      { name: "Blanc", hex: "#FFFFFF" },
    ],
    rustique: [
      { name: "Lin", hex: "#E8E1D1" },
      { name: "Brun noisette", hex: "#8B5A2B" },
      { name: "Vert mousse", hex: "#6B7D5A" },
      { name: "Rouille", hex: "#A0522D" },
    ],
    luxe: [
      { name: "Blanc perle", hex: "#F0EAD6" },
      { name: "Noir profond", hex: "#1A1A1A" },
      { name: "Doré", hex: "#C5A059" },
      { name: "Prune", hex: "#5D2D46" },
    ],
    autre: [
      { name: "Ivoire", hex: "#F5F1EB" },
      { name: "Bordeaux profond", hex: "#7C2D3A" },
      { name: "Or doux", hex: "#C9A35C" },
      { name: "Vert sauge", hex: "#8A9A7E" },
    ],
  };
  return palettes[style ?? "classique"] ?? palettes.classique;
}

export function fallbackBlueprint(answers: QuizAnswers): WeddingBlueprint {
  const styleLabel = getStyleLabel(answers);
  const reformulated = getReformulatedStyle(answers);
  const style = answers.style ?? "classique";
  const city = answers.location?.city ?? "votre destination";
  return {
    concept: `${reformulated} à ${city}`,
    conceptName: reformulated,
    emotionalSummary: `Un mariage ${reformulated.toLowerCase()} pour ${answers.guestCount ?? "vos proches"}, entre authenticité et raffinement.`,
    storytelling: `Un mariage ${styleLabel.toLowerCase()} pensé pour ${
      answers.guestCount ?? "vos"
    } invités, où chaque détail raconte votre histoire. L'ambiance générale privilégie la chaleur et l'authenticité, dans une esthétique ${styleLabel.toLowerCase()} ajustée à votre budget et au cadre de ${city}.`,
    ambiance: ["chaleureux", "authentique", "raffiné", "mémorable"],
    ambianceLevel: 7,
    colorPalette: getPalette(style),
    paletteExplanation: `Cette palette mélange des tons neutres apaisants et une couleur signature plus intense pour structurer la direction visuelle. Elle s'accorde avec l'ambiance ${styleLabel.toLowerCase()} et le cadre de ${city}.`,
    reformulatedStyle: reformulated,
    styleLevels: getStyleLevels(answers),
    inspirations: [
      { category: "Cérémonie", ideas: ["Arche végétale ou drapée", "Sièges disposés en demi-cercle"] },
      { category: "Décoration", ideas: ["Tables décorées avec une dominante de la couleur signature", "Lumière douce et bougies"] },
      { category: "Repas", ideas: ["Menu de saison inspiré du terroir", "Assiettes personnalisées ou menus calligraphiés"] },
    ],
    mistakesToAvoid: [
      "Ne pas négliger la lumière naturelle du lieu pour la cérémonie.",
      "Éviter de multiplier les couleurs au-delà de trois dominantes.",
      "Ne pas surcharger les tables au détriment des échanges conviviaux.",
    ],
  };
}

function fallbackCategoryStatuses(
  breakdown: BudgetBreakdown["breakdown"],
  total: number
): BudgetCategoryStatus[] {
  const keys = ["venue", "catering", "photography", "music", "decoration", "contingency"] as const;
  const labels: Record<string, string> = {
    venue: "Lieu",
    catering: "Traiteur & boissons",
    photography: "Photo & vidéo",
    music: "Musique & DJ",
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
  return keys.map((key) => {
    const planned = breakdown[key];
    const percentage = total > 0 ? (planned / total) * 100 : 0;
    const recommended = Math.round(total * marketRates[key].rec);
    const realisticMin = Math.round(total * marketRates[key].min);
    const realisticMax = Math.round(total * marketRates[key].max);
    const margin = planned - recommended;
    const riskLevel: "excellent" | "good" | "tight" | "critical" =
      planned >= realisticMin && planned <= realisticMax
        ? planned >= recommended * 0.9
          ? "good"
          : "excellent"
        : planned < realisticMin
          ? "tight"
          : "critical";
    const overrunEstimate = Math.max(0, realisticMin - planned);
    const savingsPotential = Math.max(0, planned - realisticMax);
    return {
      key: labels[key],
      planned,
      recommended,
      realisticMin,
      realisticMax,
      percentage,
      riskLevel,
      margin,
      savingsPotential,
      overrunEstimate,
    };
  });
}

export function fallbackBudgetBreakdown(answers: QuizAnswers): BudgetBreakdown {
  const total = answers.budget?.amount ?? 10000;
  const currency = answers.budget?.currency ?? "EUR";
  const ratios = {
    venue: 0.35,
    catering: 0.25,
    photography: 0.12,
    music: 0.08,
    decoration: 0.1,
    contingency: 0.1,
  };
  const breakdown = {
    venue: Math.round(total * ratios.venue),
    catering: Math.round(total * ratios.catering),
    photography: Math.round(total * ratios.photography),
    music: Math.round(total * ratios.music),
    decoration: Math.round(total * ratios.decoration),
    contingency: Math.round(total * ratios.contingency),
  };
  const sum = Object.values(breakdown).reduce((a, b) => a + b, 0);
  breakdown.contingency += total - sum;

  const categoryStatuses = fallbackCategoryStatuses(breakdown, total);
  const totalOverrunEstimate = categoryStatuses.reduce((acc, c) => acc + c.overrunEstimate, 0);
  const totalSavingsPotential = categoryStatuses.reduce((acc, c) => acc + c.savingsPotential, 0);
  const tightCount = categoryStatuses.filter((c) => c.riskLevel === "tight" || c.riskLevel === "critical").length;
  const globalRiskLevel: "excellent" | "good" | "tight" | "critical" =
    tightCount === 0 ? "good" : tightCount >= 2 ? "critical" : "tight";

  return {
    totalBudget: total,
    currency,
    breakdown,
    percentages: {
      venue: ratios.venue * 100,
      catering: ratios.catering * 100,
      photography: ratios.photography * 100,
      music: ratios.music * 100,
      decoration: ratios.decoration * 100,
      contingency: ratios.contingency * 100,
    },
    categoryStatuses,
    globalRiskLevel,
    totalOverrunEstimate,
    totalSavingsPotential,
  };
}

function monthsBetween(now: Date, weddingDate: string | undefined): number | null {
  if (!weddingDate) return null;
  const wedding = new Date(weddingDate);
  return (wedding.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
}

export function fallbackTimeline(answers: QuizAnswers): Timeline {
  const now = new Date();
  const highStress = (answers.stressLevel ?? 5) >= 8;
  const delegate = highStress ? " Délègue cette tâche si possible." : "";
  const monthsLeft = monthsBetween(now, answers.weddingDate);

  const milestones = [
    {
      monthsBeforeWedding: 12,
      title: "Poser les fondations",
      tasks: [
        "Fixer la date définitive",
        "Définir le budget global",
        `Réserver le lieu de réception.${delegate}`,
      ],
      priority: "critical" as const,
      urgency: monthsLeft === null || monthsLeft > 10 ? "early" as const : monthsLeft && monthsLeft > 7 ? "soon" as const : "late" as const,
      idealDeadline: "12 mois avant le jour J",
      timeNeeded: "2-4 semaines",
      consequences: "Sans lieu confirmé, tous les autres choix sont en suspens.",
      dependencies: ["Budget validé"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 11 ? ("completed" as const) : ("upcoming" as const),
    },
    {
      monthsBeforeWedding: 9,
      title: "Sécuriser les prestataires clés",
      tasks: ["Réserver le traiteur", "Choisir le photographe", "Contacter les musiciens/DJ"],
      priority: "critical" as const,
      urgency: monthsLeft === null || monthsLeft > 7 ? "early" as const : monthsLeft && monthsLeft > 5 ? "soon" as const : "late" as const,
      idealDeadline: "9 mois avant le jour J",
      timeNeeded: "3-6 semaines",
      consequences: "Les meilleurs prestataires partent vite, surtout en haute saison.",
      dependencies: ["Lieu réservé"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 8 ? ("completed" as const) : ("upcoming" as const),
    },
    {
      monthsBeforeWedding: 6,
      title: "Construire l'expérience invités",
      tasks: ["Envoyer les save-the-date", "Définir le style de décoration", "Choisir la tenue"],
      priority: "medium" as const,
      urgency: monthsLeft === null || monthsLeft > 5 ? "early" as const : monthsLeft && monthsLeft > 3 ? "soon" as const : "urgent" as const,
      idealDeadline: "6 mois avant le jour J",
      timeNeeded: "2-4 semaines",
      consequences: "Les invités ont besoin d'anticipation pour leurs agendas.",
      dependencies: ["Date et lieu confirmés"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 5 ? ("completed" as const) : ("upcoming" as const),
    },
    {
      monthsBeforeWedding: 4,
      title: "Affiner les détails",
      tasks: ["Goûter le menu", "Finaliser la liste d'invités", "Réserver l'hébergement"],
      priority: "high" as const,
      urgency: monthsLeft === null || monthsLeft > 3 ? "early" as const : monthsLeft && monthsLeft > 2 ? "soon" as const : "urgent" as const,
      idealDeadline: "4 mois avant le jour J",
      timeNeeded: "2-3 semaines",
      consequences: "Le nombre d'invités final détermine le budget final traiteur et l'hébergement.",
      dependencies: ["Prestataires clés réservés"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 3 ? ("completed" as const) : ("upcoming" as const),
    },
    {
      monthsBeforeWedding: 2,
      title: "Derniers réglages",
      tasks: ["Envoyer les invitations officielles", "Confirmer le timing avec chaque prestataire"],
      priority: "high" as const,
      urgency: monthsLeft === null || monthsLeft > 1.5 ? "early" as const : "urgent" as const,
      idealDeadline: "2 mois avant le jour J",
      timeNeeded: "1-2 semaines",
      consequences: "Les délais postaux et les ajustements avec les prestataires nécessitent de l'anticipation.",
      dependencies: ["Menu validé"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 1 ? ("completed" as const) : ("in_progress" as const),
    },
    {
      monthsBeforeWedding: 1,
      title: "Finalisation",
      tasks: [`Confirmer le nombre final d'invités.${delegate}`, "Préparer le plan de table"],
      priority: "medium" as const,
      urgency: monthsLeft === null || monthsLeft > 1 ? "early" as const : "urgent" as const,
      idealDeadline: "1 mois avant le jour J",
      timeNeeded: "1 semaine",
      consequences: "Le plan de table influe sur l'ambiance et le service du repas.",
      dependencies: ["Invitations envoyées"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 0.5 ? ("completed" as const) : ("upcoming" as const),
    },
    {
      monthsBeforeWedding: 0.25,
      title: "Dernière semaine",
      tasks: ["Briefer les prestataires", "Préparer une trousse d'urgence du jour J"],
      priority: "high" as const,
      urgency: "urgent" as const,
      idealDeadline: "1 semaine avant le jour J",
      timeNeeded: "2-3 jours",
      consequences: "Un brief clair évite les imprévus le jour J.",
      dependencies: ["Plan de table validé"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 0.1 ? ("completed" as const) : ("upcoming" as const),
    },
    {
      monthsBeforeWedding: 0,
      title: "Le grand jour",
      tasks: ["Profiter du moment", "Désigner un proche référent logistique"],
      priority: "critical" as const,
      urgency: "late" as const,
      idealDeadline: "Jour J",
      timeNeeded: "1 jour",
      consequences: "Votre mission : profiter, le reste est sous contrôle.",
      dependencies: ["Briefing effectué"],
      status: monthsLeft === null ? ("upcoming" as const) : monthsLeft < 0 ? ("overdue" as const) : ("upcoming" as const),
    },
  ];

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const globalProgress = Math.round((completedCount / milestones.length) * 100);
  const next = milestones.find((m) => m.status === "in_progress" || m.status === "upcoming") ?? null;
  const nextCriticalStep = next
    ? { title: next.title, deadline: next.idealDeadline, daysLeft: monthsLeft ? Math.max(0, Math.round(monthsLeft * 30)) : undefined }
    : null;

  return {
    milestones,
    globalProgress,
    nextCriticalStep,
  };
}

export function fallbackRiskEngine(
  answers: QuizAnswers,
  budgetBreakdown: BudgetBreakdown
): RiskEngineOutput {
  let score = 20;
  const scoreBreakdown: { label: string; points: number }[] = [{ label: "Base", points: 20 }];
  const inconsistencies: string[] = [];
  const risks: string[] = [];
  const criticalErrors: string[] = [];
  const structuredRisks: RiskItem[] = [];
  let idCounter = 1;

  const perGuest = (answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1);
  if (perGuest < 80) {
    score += 15;
    scoreBreakdown.push({ label: "Budget par invité bas", points: 15 });
    risks.push("Le budget par invité est en dessous des standards du marché local.");
    structuredRisks.push({
      id: `r${idCounter++}`,
      category: "budget",
      title: "Budget par invité serré",
      description: `Avec environ ${Math.round(perGuest)} ${answers.budget?.currency ?? "EUR"} par invité, la marge est faible pour un repas de qualité et une ambiance soignée à ${answers.location?.city ?? "ce lieu"}.`,
      severity: 7,
      probability: 8,
      impact: 8,
      solution: "Privilégiez un traiteur avec formule familiale ou food truck, et limitez les extras décoratifs.",
      priority: 9,
    });
  }

  if ((answers.stressLevel ?? 0) >= 8) {
    score += 20;
    scoreBreakdown.push({ label: "Stress élevé", points: 20 });
    risks.push("Le niveau de stress déclaré est élevé : risque de surcharge organisationnelle.");
    structuredRisks.push({
      id: `r${idCounter++}`,
      category: "organizational",
      title: "Surcharge émotionnelle",
      description: `Un stress déclaré à ${answers.stressLevel}/10 augmente le risque d'oublis et de tensions dans la préparation.`,
      severity: 6,
      probability: 9,
      impact: 6,
      solution: "Désignez un wedding planner ou un proche référent pour alléger votre charge mentale.",
      priority: 7,
    });
  }

  if (answers.weddingDate) {
    const months =
      (new Date(answers.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (months < 4) {
      score += 15;
      scoreBreakdown.push({ label: "Délai court", points: 15 });
      criticalErrors.push("Délai très court avant le mariage pour confirmer tous les prestataires.");
      structuredRisks.push({
        id: `r${idCounter++}`,
        category: "deadline",
        title: "Délai très court",
        description: `Il reste moins de 4 mois avant le jour J ; les meilleurs prestataires risquent d'être déjà pris.`,
        severity: 9,
        probability: 8,
        impact: 9,
        solution: "Contactez immédiatement le lieu et le traiteur, puis ajustez vos attêtes sur les autres postes.",
        priority: 10,
      });
    }
  }

  const sum = Object.values(budgetBreakdown.breakdown).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - budgetBreakdown.totalBudget) > budgetBreakdown.totalBudget * 0.02) {
    score += 10;
    scoreBreakdown.push({ label: "Incohérence budget", points: 10 });
    inconsistencies.push("Écart détecté entre la somme du breakdown et le budget total déclaré.");
  }

  if (risks.length === 0) {
    risks.push("Surveiller les délais de confirmation des prestataires clés.");
  }

  score = Math.min(score, 95);

  const city = answers.location?.city ?? "votre destination";
  const country = answers.location?.country ?? "";
  const budget = answers.budget?.amount ?? 0;
  const currency = answers.budget?.currency ?? "EUR";

  const generalAdvice =
    perGuest < 120
      ? `Avec un budget de ${budget} ${currency} pour ${answers.guestCount ?? "vos"} invités à ${city}${country ? `, ${country}` : ""}, soit environ ${Math.round(perGuest)} ${currency} par invité, privilégiez un lieu modulable et un traiteur avec formule simple. Réservez le lieu et la restauration en priorité, car ce sont les deux postes les plus critiques. Si le délai est court, acceptez de faire des arbitrages rapides (fleurs plus simples, musique playlist + DJ) plutôt que de chercher à tout négocier en parallèle.`
      : `Avec un budget de ${budget} ${currency} pour ${answers.guestCount ?? "vos"} invités à ${city}${country ? `, ${country}` : ""}, vous disposez d'une enveloppe confortable. Concentrez-vous sur la qualité des prestations clés : lieu, traiteur et photo/vidéo. Anticipez les délais de réservation et prévoyez un point de synchronisation avec vos prestataires 6 à 8 semaines avant le jour J. Le niveau de stress déclaré indique qu'il faut déléguer et organiser les tâches par phases. Surveillez les extras qui peuvent rapidement faire dépasser la provision imprévus.`;

  return {
    criticalErrors,
    budgetInconsistencies: inconsistencies,
    organizationalRisks: risks,
    riskScore: score,
    scoreJustification: `Score calculé à partir du budget par invité, du niveau de stress déclaré (${
      answers.stressLevel ?? "?"
    }/10) et du délai disponible avant le jour J.`,
    generalAdvice,
    scoreBreakdown,
    risks: structuredRisks.length ? structuredRisks : undefined,
  };
}
