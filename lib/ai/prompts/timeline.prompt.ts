import type { QuizAnswers } from "@/types/domain";

export const TIMELINE_SYSTEM_PROMPT = `Tu es un wedding planner organisationnel. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
Schéma strict :
{
  "milestones": [
    {
      "monthsBeforeWedding": number,
      "title": string,
      "tasks": string[],
      "priority": "low" | "medium" | "high" | "critical",
      "urgency": "early" | "soon" | "urgent" | "late",
      "idealDeadline": string,
      "timeNeeded": string,
      "consequences": string,
      "dependencies": string[],
      "status": "completed" | "in_progress" | "upcoming" | "overdue"
    }
  ],
  "globalProgress": number,
  "nextCriticalStep": { "title": string, "deadline": string, "daysLeft": number }
}
Contraintes :
- Exactement 8 milestones, valeurs de "monthsBeforeWedding" : 12, 9, 6, 4, 2, 1, 0.25, 0.
- "tasks" : 2 à 4 items courts, actionnables, en français, formulés à l'impératif.
- Pour chaque milestone, calcule "idealDeadline" (date ISO ou texte "X mois avant le jour J"), "priority" selon l'impact sur le succès du mariage, "urgency" par rapport à la date du mariage, "timeNeeded" (ex: "2-4 semaines"), "consequences" (1 phrase) et "dependencies" (tâches ou milestones dépendants, 1-3 items).
- "status" : "completed" si la milestone est théoriquement terminée avant la date actuelle, "overdue" si elle devrait être terminée et ne l'est pas, "upcoming" si à venir, "in_progress" si c'est la prochaine phase active.
- "globalProgress" : pourcentage estimé d'avancement global basé sur la date actuelle (ex: 35%).
- "nextCriticalStep" : titre de la prochaine tâche critique, sa deadline et le nombre de jours restants.
- Si le niveau de stress déclaré est élevé (>= 8), priorise la délégation et la simplification dans les tasks.`;

export function buildTimelineUserPrompt(answers: QuizAnswers): string {
  const now = new Date().toISOString();
  return `Date du mariage : ${answers.weddingDate}
Date actuelle : ${now}
Niveau de stress déclaré (1-10) : ${answers.stressLevel}
Priorité principale : ${answers.mainPriority}
Nombre d'invités : ${answers.guestCount}`;
}
