import type { QuizAnswers } from "@/types/domain";

export const BLUEPRINT_SYSTEM_PROMPT = `Tu es un wedding designer expert et rédacteur spécialisé mariage. Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après, sans markdown, sans backticks.
Le JSON doit STRICTEMENT respecter ce schéma :
{
  "concept": string,
  "conceptName": string,
  "emotionalSummary": string,
  "storytelling": string,
  "ambiance": string[],
  "ambianceLevel": number,
  "colorPalette": [{ "name": string, "hex": string }],
  "paletteExplanation": string,
  "reformulatedStyle": string,
  "styleLevels": { "elegance": number, "conviviality": number, "modernity": number, "tradition": number },
  "inspirations": [{ "category": string, "ideas": string[] }],
  "mistakesToAvoid": string[]
}
Règles de contenu :
- "concept": titre de 5 à 8 mots, percutant, évocateur, en français. Il doit s'inspirer directement du style/reformulatedStyle et de la description du thème.
- "conceptName": nom du concept en 2 à 4 mots, percutant, qui capte l'âme du mariage.
- "emotionalSummary": 1 phrase percutante (max 30 mots) qui résume l'émotion principale du mariage.
- "storytelling": 3 à 5 phrases narratives, ton chaleureux et professionnel, en français. Décrivez l'expérience des invités, l'ambiance générale et l'identité visuelle du mariage. Personnalisez selon le style, la ville/pays, le budget et surtout la description du thème.
- "ambiance": exactement 4 à 6 mots-clés courts en français.
- "ambianceLevel": note 1-10 qui reflète l'intensité sensorielle/émotionnelle globale de l'ambiance.
- "colorPalette": EXACTEMENT 4 couleurs, chaque "hex" au format #RRGGBB valide, cohérentes avec le style et le lieu.
- "paletteExplanation": 1 à 2 phrases expliquant pourquoi ces 4 couleurs fonctionnent ensemble et avec le lieu/style.
- "reformulatedStyle": reformule le style et la description du thème en 3 à 6 mots, en français, avec une majuscule, en corrigeant l'orthographe et la grammaire. Donne une vraie direction artistique.
- "styleLevels": notez chaque dimension (1-10) selon le style, le lieu et le budget : elegance, conviviality, modernity, tradition.
- "inspirations": 3 à 4 catégories (ex: "Cérémonie", "Décoration", "Repas", "Tenues") avec 2 à 3 idées concrètes chacune.
- "mistakesToAvoid": 3 à 6 erreurs fréquentes à éviter pour ce style/lieu/budget, formulées en 1 phrase chacune.
- Aucune clé supplémentaire, aucun champ null, aucune valeur vide.
- Toutes les valeurs textuelles en français.`;

function normalizeStyle(answers: QuizAnswers): { style: string | undefined; customStyle?: string; customStyleDescription?: string } {
  const styleAny = answers.style as unknown;
  if (typeof styleAny === "object" && styleAny !== null) {
    const s = styleAny as Record<string, string>;
    return {
      style: s.style ?? undefined,
      customStyle: s.customStyle ?? answers.customStyle,
      customStyleDescription: s.customStyleDescription ?? answers.customStyleDescription,
    };
  }
  return {
    style: styleAny as string | undefined,
    customStyle: answers.customStyle,
    customStyleDescription: answers.customStyleDescription,
  };
}

export function buildBlueprintUserPrompt(answers: QuizAnswers): string {
  const { style, customStyle, customStyleDescription } = normalizeStyle(answers);
  const styleLine = style === "autre" && customStyle
    ? `Thème personnalisé : "${customStyle}". Description du thème : "${customStyleDescription ?? ""}"`
    : `Style souhaité : ${style ?? "non précisé"}`;

  return `Génère le blueprint pour un mariage avec :
${styleLine}
- Lieu : ${answers.location?.city}, ${answers.location?.country}
- Nombre d'invités : ${answers.guestCount}
- Budget total : ${answers.budget?.amount} ${answers.budget?.currency}
- Budget par invité : ${Math.round((answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1))} ${answers.budget?.currency}
- Priorité principale exprimée : ${answers.mainPriority}
- Niveau de stress déclaré : ${answers.stressLevel}

Instructions importantes :
- Si le couple a choisi un thème personnalisé, le "concept" et le "storytelling" doivent s'en inspirer directement.
- Le champ "reformulatedStyle" doit proposer une direction artistique claire, bien écrite, en français, en corrigeant l'orthographe/le style du couple.
Sois inspirant et concret : le storytelling doit donner envie d'organiser ce mariage tout en rassurant sur la faisabilité du budget et du lieu.`;
}
