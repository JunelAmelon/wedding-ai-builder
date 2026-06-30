import type { QuizAnswers, BudgetBreakdown } from "@/types/domain";

export const RISK_SYSTEM_PROMPT = `Tu es un wedding planner senior et analyste de risques événementiels. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
Schéma strict :
{
  "criticalErrors": string[],
  "budgetInconsistencies": string[],
  "organizationalRisks": string[],
  "riskScore": number,
  "scoreJustification": string,
  "generalAdvice": string
}
Règles de contenu :
- Chaque élément de "criticalErrors" doit être un paragraphe de 40 à 80 mots, avec diagnostic + conseil concret, adapté au budget par invité, à la ville/pays et au délai restant.
- Chaque élément de "budgetInconsistencies" doit être un paragraphe de 40 à 80 mots expliquant un risque budgétaire et comment l'atténuer (re-négociation, choix alternatifs, arbitrages réalistes).
- "organizationalRisks" ne doit jamais être vide (min 1, max 4). Chaque élément doit être un paragraphe de 40 à 80 mots avec recommandation opérationnelle.
- "scoreJustification" : 1 à 2 phrases en français, calculée à partir du budget par invité, du stress déclaré et du délai avant le jour J.
- "generalAdvice" : un paragraphe de 100 à 180 mots avec une synthèse professionnelle, un plan d'action prioritaire et des conseils personnalisés selon la ville, le pays, le budget, le nombre d'invités et le niveau de stress.
Calibration du score (déterministe) :
- Base 20.
- +15 si le budget total / nombre d'invités est inférieur au seuil bas du marché local.
- +20 si le niveau de stress déclaré est >= 8.
- +15 si la date du mariage est à moins de 4 mois ET qu'aucun prestataire n'est supposé confirmé.
- +10 par incohérence budgétaire détectée (plafonné à +30 au total pour ce critère).
- Plafonne le score final à 95 maximum. Minimum réaliste : 10.`;

function styleLabel(answers: QuizAnswers): string {
  if (answers.style === "autre" && answers.customStyle) {
    return `${answers.customStyle}${answers.customStyleDescription ? ` - ${answers.customStyleDescription}` : ""}`;
  }
  return answers.style ?? "non précisé";
}

export function buildRiskUserPrompt(answers: QuizAnswers, budgetBreakdown: BudgetBreakdown): string {
  return `Budget total : ${answers.budget?.amount} ${answers.budget?.currency} pour ${answers.guestCount} invités à ${answers.location?.city}, ${answers.location?.country}
Date du mariage : ${answers.weddingDate}
Niveau de stress (1-10) : ${answers.stressLevel}
Style de mariage : ${styleLabel(answers)}
Priorité principale : ${answers.mainPriority}
Budget breakdown calculé : ${JSON.stringify(budgetBreakdown)}`;
}
