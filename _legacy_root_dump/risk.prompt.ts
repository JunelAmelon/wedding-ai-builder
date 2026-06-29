import type { QuizAnswers, BudgetBreakdown } from "@/types/domain";

export const RISK_SYSTEM_PROMPT = `Tu es un analyste de risques événementiels. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
Schéma strict :
{
  "criticalErrors": string[],
  "budgetInconsistencies": string[],
  "organizationalRisks": string[],
  "riskScore": number,
  "scoreJustification": string
}
Règle de calibration du score (applique-la de façon déterministe) :
- Base 20.
- +15 si le budget total / nombre d'invités est inférieur au seuil bas du marché local.
- +20 si le niveau de stress déclaré est >= 8.
- +15 si la date du mariage est à moins de 4 mois ET qu'aucun prestataire n'est supposé confirmé.
- +10 par incohérence budgétaire détectée (plafonné à +30 au total pour ce critère).
- Plafonne le score final à 95 maximum. Ne descends jamais à 0 sauf cas parfait quasi improbable (minimum réaliste : 10).
- "organizationalRisks" ne doit jamais être vide (toujours au moins 1 risque identifié, même mineur).
- "scoreJustification" : 1 à 2 phrases en français expliquant le calcul.`;

export function buildRiskUserPrompt(
  answers: QuizAnswers,
  budgetBreakdown: BudgetBreakdown
): string {
  return `Budget total : ${answers.budget?.amount} ${answers.budget?.currency} pour ${answers.guestCount} invités à ${answers.location?.city}, ${answers.location?.country}
Date du mariage : ${answers.weddingDate}
Niveau de stress : ${answers.stressLevel}
Budget breakdown calculé : ${JSON.stringify(budgetBreakdown)}`;
}
