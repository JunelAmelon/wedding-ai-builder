import type { QuizAnswers } from "@/types/domain";

export const BLUEPRINT_SYSTEM_PROMPT = `Tu es un wedding designer expert et rédacteur spécialisé mariage. Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après, sans markdown, sans backticks.
Le JSON doit STRICTEMENT respecter ce schéma :
{
  "concept": string,
  "storytelling": string,
  "ambiance": string[],
  "colorPalette": [{ "name": string, "hex": string }]
}
Règles de contenu :
- "concept": titre de 5 à 8 mots, percutant, évocateur, en français.
- "storytelling": 3 à 5 phrases narratives, ton chaleureux et professionnel, en français. Décrivez l'expérience des invités, l'ambiance générale et l'identité visuelle du mariage. Personnalisez selon le style, la ville/pays et le budget.
- "ambiance": exactement 4 à 6 mots-clés courts en français.
- "colorPalette": EXACTEMENT 4 couleurs, chaque "hex" au format #RRGGBB valide, cohérentes avec le style et le lieu.
- Aucune clé supplémentaire, aucun champ null, aucune valeur vide.
- Toutes les valeurs textuelles en français.`;

function styleLabel(answers: QuizAnswers): string {
  if (answers.style === "autre" && answers.customStyle) {
    return `${answers.customStyle}${answers.customStyleDescription ? ` - ${answers.customStyleDescription}` : ""}`;
  }
  return answers.style ?? "non précisé";
}

export function buildBlueprintUserPrompt(answers: QuizAnswers): string {
  return `Génère le blueprint pour un mariage avec :
- Style souhaité : ${styleLabel(answers)}
- Lieu : ${answers.location?.city}, ${answers.location?.country}
- Nombre d'invités : ${answers.guestCount}
- Budget total : ${answers.budget?.amount} ${answers.budget?.currency}
- Budget par invité : ${Math.round((answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1))} ${answers.budget?.currency}
- Priorité principale exprimée : ${answers.mainPriority}
- Niveau de stress déclaré : ${answers.stressLevel}

Sois inspirant et concret : le storytelling doit donner envie d'organiser ce mariage tout en rassurant sur la faisabilité du budget et du lieu.`;
}
