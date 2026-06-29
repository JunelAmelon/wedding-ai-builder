import type { QuizAnswers } from "@/types/domain";

export const BUDGET_SYSTEM_PROMPT = `Tu es un planificateur financier de mariages. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
Schéma strict :
{
  "totalBudget": number,
  "currency": string,
  "breakdown": {
    "venue": number, "catering": number, "photography": number,
    "music": number, "decoration": number, "contingency": number
  },
  "percentages": {
    "venue": number, "catering": number, "photography": number,
    "music": number, "decoration": number, "contingency": number
  }
}
Contraintes STRICTES :
- La somme des valeurs de "breakdown" doit être ÉGALE à "totalBudget" (tolérance d'arrondi 1% maximum).
- "contingency" doit représenter entre 8% et 12% du total (jamais moins de 8%, jamais plus de 12%).
- Les valeurs de "percentages" doivent sommer à 100 (±0.5 toléré).
- "totalBudget" doit être exactement égal au budget fourni en entrée, ne l'arrondis pas.`;

export function buildBudgetUserPrompt(answers: QuizAnswers): string {
  return `Budget total : ${answers.budget?.amount} ${answers.budget?.currency}
Localisation : ${answers.location?.city}, ${answers.location?.country} (ajuste les ratios selon le coût de vie local)
Nombre d'invités : ${answers.guestCount}
Style : ${answers.style}`;
}
