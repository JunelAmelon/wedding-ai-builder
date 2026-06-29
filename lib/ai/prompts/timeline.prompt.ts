import type { QuizAnswers } from "@/types/domain";

export const TIMELINE_SYSTEM_PROMPT = `Tu es un wedding planner organisationnel. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
Schéma strict :
{
  "milestones": [
    { "monthsBeforeWedding": number, "title": string, "tasks": string[] }
  ]
}
Contraintes :
- Exactement 8 milestones, valeurs de "monthsBeforeWedding" : 12, 9, 6, 4, 2, 1, 0.25, 0.
- "tasks" : 2 à 4 items courts, actionnables, en français, formulés à l'impératif.
- Si le niveau de stress déclaré est élevé (>= 8), priorise la délégation et la simplification dans les tasks.
- "title" : court intitulé de phase (ex: "Poser les fondations", "Confirmer les prestataires").`;

export function buildTimelineUserPrompt(answers: QuizAnswers): string {
  return `Date du mariage : ${answers.weddingDate}
Niveau de stress déclaré (1-10) : ${answers.stressLevel}
Priorité principale : ${answers.mainPriority}
Nombre d'invités : ${answers.guestCount}`;
}
