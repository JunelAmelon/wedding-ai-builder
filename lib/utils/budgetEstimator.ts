import type { WeddingProject } from "@/types/marketplace";
import type { BudgetBreakdown } from "@/types/domain";

export interface BudgetEstimateResult {
  min: number;
  max: number;
  source: "ai_plan" | "project_budget" | "benchmark";
  sourceLabel: string;
}

export const CATEGORY_TO_BUDGET_KEYS: Record<string, string[]> = {
  "Photographe / Vidéaste": ["photography", "videography", "photoVideo"],
  "Musique / DJ / Orchestre": ["music", "dj"],
  "Traiteur": ["catering"],
  "Lieu de réception": ["venue"],
  "Décoration / Fleuriste": ["decoration", "flowers", "floral"],
  "Wedding planner": ["weddingPlanner", "planner"],
  "Maquilleur / Coiffeur": ["beauty", "hairMakeup"],
  "Animation": ["animations", "fireworks", "animation"],
  "Transport": ["transport"],
  "Hébergement": ["accommodation", "lodging"],
  "Conception de robe de mariée": ["attire", "dress"],
  "Bijoutier": ["rings", "jewelry"],
  "Officiant": ["officiant", "ceremony"],
  "Autre": ["other", "giftsFavours"],
};

export const CATEGORY_DEFAULT_RATIOS: Record<
  string,
  { minRatio: number; maxRatio: number; defaultMin: number; defaultMax: number }
> = {
  "Lieu de réception": { minRatio: 0.25, maxRatio: 0.35, defaultMin: 3500, defaultMax: 7500 },
  "Traiteur": { minRatio: 0.25, maxRatio: 0.35, defaultMin: 4000, defaultMax: 8000 },
  "Photographe / Vidéaste": { minRatio: 0.08, maxRatio: 0.14, defaultMin: 1200, defaultMax: 2500 },
  "Musique / DJ / Orchestre": { minRatio: 0.05, maxRatio: 0.10, defaultMin: 800, defaultMax: 1800 },
  "Décoration / Fleuriste": { minRatio: 0.06, maxRatio: 0.12, defaultMin: 1000, defaultMax: 2500 },
  "Wedding planner": { minRatio: 0.08, maxRatio: 0.15, defaultMin: 1500, defaultMax: 3500 },
  "Maquilleur / Coiffeur": { minRatio: 0.02, maxRatio: 0.04, defaultMin: 250, defaultMax: 600 },
  "Animation": { minRatio: 0.03, maxRatio: 0.06, defaultMin: 500, defaultMax: 1200 },
  "Transport": { minRatio: 0.02, maxRatio: 0.04, defaultMin: 300, defaultMax: 800 },
  "Hébergement": { minRatio: 0.03, maxRatio: 0.08, defaultMin: 600, defaultMax: 1800 },
  "Conception de robe de mariée": { minRatio: 0.05, maxRatio: 0.10, defaultMin: 800, defaultMax: 2000 },
  "Bijoutier": { minRatio: 0.03, maxRatio: 0.06, defaultMin: 500, defaultMax: 1500 },
  "Officiant": { minRatio: 0.02, maxRatio: 0.04, defaultMin: 300, defaultMax: 800 },
  "Autre": { minRatio: 0.02, maxRatio: 0.05, defaultMin: 300, defaultMax: 1000 },
};

const DIETARY_LABELS: Record<string, string> = {
  vegetarien: "Végétarien",
  vegan: "Vegan",
  halal: "Halal",
  casher: "Casher",
  "sans-gluten": "Sans gluten",
  allergies: "Allergies spécifiques",
  autre: "Autre régime",
};

const STYLE_LABELS: Record<string, string> = {
  boheme: "Bohème",
  classique: "Classique & élégant",
  moderne: "Moderne & minimaliste",
  destination: "Destination wedding",
  rustique: "Rustique & champêtre",
  luxe: "Luxe & raffiné",
};

const PRIORITY_LABELS: Record<string, string> = {
  budget: "Maîtriser le budget & bon rapport qualité/prix",
  lieu: "Cadre d'exception & lieu coup de cœur",
  prestataires: "Professionnalisme & qualité de prestation",
  invites: "Confort, accueil et expérience des invités",
  deco: "Décoration raffinée & ambiance soignée",
  coordination: "Coordination fluide & ponctualité le jour J",
  stress: "Zéro stress & sérénité totale",
};

function resolveCategoryKey(cat: string): string {
  if (CATEGORY_DEFAULT_RATIOS[cat]) return cat;
  const lower = cat.toLowerCase();
  for (const known of Object.keys(CATEGORY_DEFAULT_RATIOS)) {
    if (known.toLowerCase().includes(lower) || lower.includes(known.toLowerCase())) {
      return known;
    }
  }
  return "Autre";
}

/**
 * Calcule automatiquement une tranche budgétaire cohérente pour une catégorie de prestataire donnée.
 * Ordre de priorité :
 * 1. Plan IA (fourchettes ou prévisions personnalisées de l'audit)
 * 2. Ratios standards appliqués au budget global du projet
 * 3. Référentiel moyen du marché français
 */
export function estimateBudgetForCategory(
  category: string,
  project?: WeddingProject | null,
  aiBudget?: BudgetBreakdown | null
): BudgetEstimateResult | null {
  if (!category) return null;

  const matchedCat = resolveCategoryKey(category);
  const budgetKeys = CATEGORY_TO_BUDGET_KEYS[matchedCat] || ["other"];
  const config = CATEGORY_DEFAULT_RATIOS[matchedCat] || CATEGORY_DEFAULT_RATIOS["Autre"];

  // 1. Recherche dans l'audit IA (categoryStatuses)
  if (aiBudget?.categoryStatuses && aiBudget.categoryStatuses.length > 0) {
    const matchingStatuses = aiBudget.categoryStatuses.filter((s) => budgetKeys.includes(s.key));
    if (matchingStatuses.length > 0) {
      const sumRealisticMin = matchingStatuses.reduce((sum, s) => sum + (s.realisticMin || 0), 0);
      const sumRealisticMax = matchingStatuses.reduce((sum, s) => sum + (s.realisticMax || 0), 0);
      const sumPlanned = matchingStatuses.reduce((sum, s) => sum + (s.planned || 0), 0);

      if (sumRealisticMin > 0 && sumRealisticMax > 0 && sumRealisticMax >= sumRealisticMin) {
        return {
          min: Math.round(sumRealisticMin / 50) * 50,
          max: Math.round(sumRealisticMax / 50) * 50,
          source: "ai_plan",
          sourceLabel: "Estimation issue de votre plan IA personnalisé",
        };
      }

      if (sumPlanned > 0) {
        return {
          min: Math.max(50, Math.round((sumPlanned * 0.85) / 50) * 50),
          max: Math.round((sumPlanned * 1.15) / 50) * 50,
          source: "ai_plan",
          sourceLabel: "Estimation issue de votre plan IA personnalisé",
        };
      }
    }
  }

  // 2. Recherche dans le breakdown direct de l'IA
  if (aiBudget?.breakdown) {
    const sumBreakdown = budgetKeys.reduce((sum, key) => sum + (aiBudget.breakdown[key] || 0), 0);
    if (sumBreakdown > 0) {
      return {
        min: Math.max(50, Math.round((sumBreakdown * 0.85) / 50) * 50),
        max: Math.round((sumBreakdown * 1.15) / 50) * 50,
        source: "ai_plan",
        sourceLabel: "Estimation issue de votre plan IA personnalisé",
      };
    }
  }

  // Si un plan IA a été généré mais qu'aucun budget n'est alloué à cette catégorie,
  // ne rien renseigner automatiquement (champs vides).
  if (aiBudget && (aiBudget.breakdown || (aiBudget.categoryStatuses && aiBudget.categoryStatuses.length > 0))) {
    return null;
  }

  // 3. Si aucun plan IA n'est disponible MAIS que le couple a défini un budget global
  // et que la catégorie fait explicitement partie de ses catégories souhaitées
  const totalAmount = project?.budget?.amount;
  if (typeof totalAmount === "number" && totalAmount > 0) {
    const desired = project?.desiredCategories || [];
    const isDesired =
      desired.length > 0 &&
      desired.some((d) => {
        const lowerD = d.toLowerCase();
        const lowerCat = category.toLowerCase();
        return lowerD.includes(lowerCat) || lowerCat.includes(lowerD) || budgetKeys.includes(lowerD);
      });

    if (isDesired) {
      const config = CATEGORY_DEFAULT_RATIOS[matchedCat] || CATEGORY_DEFAULT_RATIOS["Autre"];
      const calculatedMin = Math.round((totalAmount * config.minRatio) / 50) * 50;
      const calculatedMax = Math.round((totalAmount * config.maxRatio) / 50) * 50;
      if (calculatedMin > 0 && calculatedMax > 0) {
        return {
          min: Math.max(100, calculatedMin),
          max: Math.max(calculatedMin + 100, calculatedMax),
          source: "project_budget",
          sourceLabel: `Estimation calculée sur votre budget global (${totalAmount.toLocaleString("fr-FR")} €)`,
        };
      }
    }
  }

  // S'il n'y a aucun budget disponible ou alloué à cette catégorie, ne rien renseigner (champs vides).
  return null;
}

/**
 * Pré-remplit les exigences spécifiques UNIQUEMENT si l'utilisateur a explicitement
 * renseigné un besoin correspondant dans le Quiz (Étape 7 : Besoins spécifiques).
 * Si aucun besoin spécifique n'a été renseigné pour cette catégorie, le champ reste STRICTEMENT VIDE.
 */
export function estimateRequirementsForCategory(
  category: string,
  project?: WeddingProject | null
): string {
  if (!category || !project) return "";
  const matchedCat = resolveCategoryKey(category);
  const items: string[] = [];

  if (matchedCat === "Traiteur") {
    // Régimes alimentaires explicitement cochés à l'étape 7
    if (project.dietaryNeeds && project.dietaryNeeds.length > 0) {
      project.dietaryNeeds.forEach((need) => {
        // Ignorer le tag générique "allergies" si un texte de détail est fourni juste après
        if (need === "allergies" && project.dietaryDetails && project.dietaryDetails.trim()) {
          return;
        }
        const label = DIETARY_LABELS[need];
        if (label && !items.includes(label)) items.push(label);
      });
    }
    // Précision des allergies saisie au clavier par l'utilisateur
    if (project.dietaryDetails && project.dietaryDetails.trim()) {
      items.push(`Allergies : ${project.dietaryDetails.trim()}`);
    }
  } else if (matchedCat === "Lieu de réception") {
    // Uniquement si l'utilisateur a répondu "Oui" aux besoins de mobilité réduite
    if (project.mobilityNeeds === true) {
      items.push("Accès PMR (personnes à mobilité réduite)");
    }
  }

  // Pour toutes les autres catégories (Transport, Photographe, DJ, Fleuriste, Déco...),
  // aucun besoin spécifique n'a été demandé au Quiz pour ce métier : le champ reste vide.
  return items.join(", ");
}

/**
 * Pré-remplit la priorité principale selon la réponse n°1 déclarée au Quiz (Étape 9).
 * Si aucune priorité n'a été choisie, reste vide.
 */
export function estimatePriorityForCategory(
  category: string,
  project?: WeddingProject | null
): string {
  if (!project) return "";
  if (project.mainPriority && PRIORITY_LABELS[project.mainPriority]) {
    return PRIORITY_LABELS[project.mainPriority];
  }
  return "";
}
