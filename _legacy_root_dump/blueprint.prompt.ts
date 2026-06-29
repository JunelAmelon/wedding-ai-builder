import type { QuizAnswers } from "@/types/domain";

export const BLUEPRINT_SYSTEM_PROMPT = `Tu es un wedding designer expert. Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après, sans markdown, sans backticks.
Le JSON doit STRICTEMENT respecter ce schéma :
{
  "concept": string,
  "storytelling": string,
  "ambiance": string[],
  "colorPalette": [{ "name": string, "hex": string }]
}
Règles :
- "concept": titre de 5 à 8 mots, percutant.
- "storytelling": 2 à 3 phrases narratives, ton chaleureux, en français.
- "ambiance": exactement 4 à 6 mots-clés.
- "colorPalette": EXACTEMENT 4 couleurs, chaque "hex" au format #RRGGBB valide.
- Aucune clé supplémentaire, aucun champ null, aucune valeur vide.
- Toutes les valeurs textuelles en français.`;

export function buildBlueprintUserPrompt(answers: QuizAnswers): string {
  return `Génère le blueprint pour un mariage avec :
- Style souhaité : ${answers.style}
- Lieu : ${answers.location?.city}, ${answers.location?.country}
- Nombre d'invités : ${answers.guestCount}
- Budget total : ${answers.budget?.amount} ${answers.budget?.currency}
- Priorité principale exprimée : ${answers.mainPriority}`;
}
