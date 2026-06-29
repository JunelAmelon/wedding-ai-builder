import type {
  QuizAnswers,
  WeddingBlueprint,
  BudgetBreakdown,
  Timeline,
  RiskEngineOutput,
} from "@/types/domain";

const STYLE_LABELS: Record<string, string> = {
  boheme: "Bohème",
  classique: "Classique & élégant",
  moderne: "Moderne & minimaliste",
  destination: "Destination Wedding",
  rustique: "Rustique & champêtre",
  luxe: "Luxe & raffiné",
};

export function fallbackBlueprint(answers: QuizAnswers): WeddingBlueprint {
  const styleLabel = STYLE_LABELS[answers.style ?? "classique"] ?? "Élégant intemporel";
  return {
    concept: `${styleLabel} à ${answers.location?.city ?? "votre destination"}`,
    storytelling: `Un mariage ${styleLabel.toLowerCase()} pensé pour ${
      answers.guestCount ?? "vos"
    } invités, où chaque détail raconte votre histoire. L'ambiance générale privilégie la chaleur et l'authenticité.`,
    ambiance: ["chaleureux", "authentique", "raffiné", "mémorable"],
    colorPalette: [
      { name: "Ivoire", hex: "#F5F1EB" },
      { name: "Bordeaux profond", hex: "#7C2D3A" },
      { name: "Or doux", hex: "#C9A35C" },
      { name: "Vert sauge", hex: "#8A9A7E" },
    ],
  };
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
  // Ajuste le dernier poste pour que la somme soit exacte
  const sum = Object.values(breakdown).reduce((a, b) => a + b, 0);
  breakdown.contingency += total - sum;

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
  };
}

export function fallbackTimeline(answers: QuizAnswers): Timeline {
  const highStress = (answers.stressLevel ?? 5) >= 8;
  const delegate = highStress ? " Délègue cette tâche si possible." : "";
  return {
    milestones: [
      {
        monthsBeforeWedding: 12,
        title: "Poser les fondations",
        tasks: [
          "Fixer la date définitive",
          "Définir le budget global",
          `Réserver le lieu de réception.${delegate}`,
        ],
      },
      {
        monthsBeforeWedding: 9,
        title: "Sécuriser les prestataires clés",
        tasks: ["Réserver le traiteur", "Choisir le photographe", "Contacter les musiciens/DJ"],
      },
      {
        monthsBeforeWedding: 6,
        title: "Construire l'expérience invités",
        tasks: ["Envoyer les save-the-date", "Définir le style de décoration", "Choisir la tenue"],
      },
      {
        monthsBeforeWedding: 4,
        title: "Affiner les détails",
        tasks: ["Goûter le menu", "Finaliser la liste d'invités", "Réserver l'hébergement"],
      },
      {
        monthsBeforeWedding: 2,
        title: "Derniers réglages",
        tasks: ["Envoyer les invitations officielles", "Confirmer le timing avec chaque prestataire"],
      },
      {
        monthsBeforeWedding: 1,
        title: "Finalisation",
        tasks: [`Confirmer le nombre final d'invités.${delegate}`, "Préparer le plan de table"],
      },
      {
        monthsBeforeWedding: 0.25,
        title: "Dernière semaine",
        tasks: ["Briefer les prestataires", "Préparer une trousse d'urgence du jour J"],
      },
      {
        monthsBeforeWedding: 0,
        title: "Le grand jour",
        tasks: ["Profiter du moment", "Désigner un proche référent logistique"],
      },
    ],
  };
}

export function fallbackRiskEngine(
  answers: QuizAnswers,
  budgetBreakdown: BudgetBreakdown
): RiskEngineOutput {
  let score = 20;
  const inconsistencies: string[] = [];
  const risks: string[] = [];
  const criticalErrors: string[] = [];

  const perGuest = (answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1);
  if (perGuest < 80) {
    score += 15;
    risks.push("Le budget par invité est en dessous des standards du marché local.");
  }

  if ((answers.stressLevel ?? 0) >= 8) {
    score += 20;
    risks.push("Le niveau de stress déclaré est élevé : risque de surcharge organisationnelle.");
  }

  if (answers.weddingDate) {
    const months =
      (new Date(answers.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (months < 4) {
      score += 15;
      criticalErrors.push("Délai très court avant le mariage pour confirmer tous les prestataires.");
    }
  }

  const sum = Object.values(budgetBreakdown.breakdown).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - budgetBreakdown.totalBudget) > budgetBreakdown.totalBudget * 0.02) {
    score += 10;
    inconsistencies.push("Écart détecté entre la somme du breakdown et le budget total déclaré.");
  }

  if (risks.length === 0) {
    risks.push("Surveiller les délais de confirmation des prestataires clés.");
  }

  score = Math.min(score, 95);

  return {
    criticalErrors,
    budgetInconsistencies: inconsistencies,
    organizationalRisks: risks,
    riskScore: score,
    scoreJustification: `Score calculé à partir du budget par invité, du niveau de stress déclaré (${
      answers.stressLevel ?? "?"
    }/10) et du délai disponible avant le jour J.`,
  };
}
