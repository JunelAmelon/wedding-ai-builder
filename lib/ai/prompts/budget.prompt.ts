import type { QuizAnswers } from "@/types/domain";

export const BUDGET_SYSTEM_PROMPT = `Tu es un planificateur financier de mariages senior. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
Schéma strict :
{
  "totalBudget": number,
  "currency": string,
  "breakdown": { "<poste_en_camelCase>": number, ... },
  "percentages": { "<poste_en_camelCase>": number, ... },
  "categoryStatuses": [
    {
      "key": "<poste_en_camelCase>",
      "planned": number,
      "recommended": number,
      "realisticMin": number,
      "realisticMax": number,
      "percentage": number,
      "riskLevel": "excellent" | "good" | "tight" | "critical",
      "margin": number,
      "savingsPotential": number,
      "overrunEstimate": number
    }
  ],
  "globalRiskLevel": "excellent" | "good" | "tight" | "critical",
  "totalOverrunEstimate": number,
  "totalSavingsPotential": number
}
Contraintes STRICTES ET NON NÉGOCIABLES :
- Le breakdown doit inclure au minimum les postes clés : venue, catering, photography, videography, music, decoration, flowers, attire, rings, beauty, stationery, transport, accommodation, cake, weddingPlanner, officiant, giftsFavours, contingency.
- "contingency" (imprévus) doit représenter OBLIGATOIREMENT entre 8% et 12% du total (idéalement 10%).
- La somme exacte de tous les montants de "breakdown" DOIT ÊTRE ÉGALE à "totalBudget" (tolérance maximale de 1%).
- Les valeurs de "percentages" DOIVENT Sommer exactement à 100 (tolérance ±0.5%).
- "totalBudget" doit être strictement identique au budget fourni en entrée.
- Tous les montants dans "breakdown" doivent être des nombres positifs ou nuls (arrondis à l'unité).
- Pour "categoryStatuses", fournis obligatoirement une entrée par poste du breakdown :
  - "planned" = montant alloué dans breakdown.
  - "recommended" = montant de référence sur ce marché local.
  - "realisticMin" et "realisticMax" = fourchette basse et haute réaliste.
  - "margin" = planned - recommended.
  - "savingsPotential" = économies possibles sans sacrifier l'expérience.
  - "overrunEstimate" = dépassement probable si poste sous-évalué.
- "globalRiskLevel" : "excellent" si budget confortable, "good" si équilibré, "tight" si tendu, "critical" si déficit majeur.
Règles de réalisme métier :
- Le lieu (venue) et le traiteur (catering) représentent ensemble 45% à 60% du budget total d'un mariage en France.
- Ajuste les coûts selon la ville (Paris/IDF et Côte d'Azur sont 20% à 35% plus chers que la moyenne).
- Si un poste est optionnel ou non souhaité, il peut valoir 0, et l'économie est réinjectée dans les autres postes prioritaires.`;

function styleLabel(answers: QuizAnswers): string {
  if (answers.style === "autre" && answers.customStyle) {
    return `${answers.customStyle}${answers.customStyleDescription ? ` - ${answers.customStyleDescription}` : ""}`;
  }
  return answers.style ?? "non précisé";
}

export function buildBudgetUserPrompt(answers: QuizAnswers): string {
  const amount = answers.budget?.amount && answers.budget.amount > 0 ? answers.budget.amount : 20000;
  const currency = answers.budget?.currency || "EUR";
  const guestCount = Math.max(answers.guestCount ?? 1, 1);
  const budgetPerGuest = Math.round(amount / guestCount);
  const city = answers.location?.city || "Paris";
  const country = answers.location?.country || "France";

  return `Budget total : ${amount} ${currency} (Contrainte stricte : la somme exacte de toutes les catégories de breakdown DOIT faire ${amount})
Devise : ${currency}
Date du mariage : ${answers.weddingDate && answers.weddingDate !== "not-fixed" ? answers.weddingDate : "non précisée"}
Localisation : ${city}, ${country} (ajuste les coûts selon le marché de cette zone)
Nombre d'invités : ${answers.guestCount ?? 60}${answers.childrenCount ? ` (dont ${answers.childrenCount} enfants)` : ""}
Budget par invité : ${budgetPerGuest} ${currency}
Style : ${styleLabel(answers)}
Ambiances recherchées : ${answers.ambiance?.length ? answers.ambiance.join(", ") : "non précisé"}
Prestataires recherchés : ${answers.desiredCategories?.length ? answers.desiredCategories.join(", ") : "non précisé"}
Besoins alimentaires spécifiques : ${answers.dietaryNeeds?.length ? answers.dietaryNeeds.join(", ") : "aucun"}
Invités venant de loin : ${answers.guestsFromFar ? "oui" : "non"}
Priorité principale : ${answers.mainPriority ?? "Équilibre global"}
Niveau de stress déclaré (1-10) : ${answers.stressLevel ?? 5}`;
}
