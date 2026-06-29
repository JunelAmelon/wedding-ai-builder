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
Localisation : ${answers.location?.city}, ${answers.location?.country} (ajuste les ratios selon le coût de vie local et le marché du mariage local)
Nombre d'invités : ${answers.guestCount}
Budget par invité : ${Math.round((answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1))} ${answers.budget?.currency}
Style : ${answers.style}
Priorité principale : ${answers.mainPriority}
Niveau de stress : ${answers.stressLevel}

Conseils pour la répartition :
- Le lieu de réception et le traiteur sont généralement les deux plus gros postes dans un mariage en France/Europe.
- Le poste "imprévus" doit être conservé entre 8% et 12% du total pour absorber les dépassements courants (taxes, extras, transport).
- Ajuste les montants selon le coût de la vie à la localisation (Paris, Côte d'Azur et grandes villes ont des tarifs plus élevés).
- Le nombre d'invités impacte principalement le traiteur et les boissons.`;
}
