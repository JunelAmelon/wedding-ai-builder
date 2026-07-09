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
  },
  "categoryStatuses": [
    {
      "key": "venue",
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
Contraintes STRICTES :
- La somme des valeurs de "breakdown" doit être ÉGALE à "totalBudget" (tolérance d'arrondi 1% maximum).
- "contingency" doit représenter entre 8% et 12% du total.
- Les valeurs de "percentages" doivent sommer à 100 (±0.5 toléré).
- "totalBudget" doit être exactement égal au budget fourni en entrée, ne l'arrondis pas.
- Pour "categoryStatuses", fournis obligatoirement 6 entrées : venue, catering, photography, music, decoration, contingency. Les montants doivent refléter le marché local (ville/pays) et le budget par invité.
- "recommended" est le montant idéal pour ce marché. "realisticMin/Max" sont les fourchettes réalistes. "margin" = planned - recommended (négatif = sous-budgeté). "savingsPotential" est l'économie maximale réalisable sans dégrader l'expérience. "overrunEstimate" est le dépassement probable si rien n'est arbitré.
- "globalRiskLevel" synthétise le risque global : excellent (marge confortable), good (équilibré), tight (risqué), critical (déséquilibre majeur).
- "totalOverrunEstimate" et "totalSavingsPotential" sont des montants totaux estimés.`;

function styleLabel(answers: QuizAnswers): string {
  if (answers.style === "autre" && answers.customStyle) {
    return `${answers.customStyle}${answers.customStyleDescription ? ` - ${answers.customStyleDescription}` : ""}`;
  }
  return answers.style ?? "non précisé";
}

export function buildBudgetUserPrompt(answers: QuizAnswers): string {
  return `Budget total : ${answers.budget?.amount} ${answers.budget?.currency}
Localisation : ${answers.location?.city}, ${answers.location?.country} (ajuste les ratios selon le coût de vie local et le marché du mariage local)
Nombre d'invités : ${answers.guestCount}
Budget par invité : ${Math.round((answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1))} ${answers.budget?.currency}
Style : ${styleLabel(answers)}
Priorité principale : ${answers.mainPriority}
Niveau de stress : ${answers.stressLevel}

Conseils pour la répartition :
- Le lieu de réception et le traiteur sont généralement les deux plus gros postes dans un mariage en France/Europe.
- Le poste "imprévus" doit être conservé entre 8% et 12% du total pour absorber les dépassements courants (taxes, extras, transport).
- Ajuste les montants selon le coût de la vie à la localisation (Paris, Côte d'Azur et grandes villes ont des tarifs plus élevés).
- Le nombre d'invités impacte principalement le traiteur et les boissons.`;
}
