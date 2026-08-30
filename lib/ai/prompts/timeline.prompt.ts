import type { QuizAnswers } from "@/types/domain";

export const TIMELINE_SYSTEM_PROMPT = `Tu es un wedding planner organisationnel senior. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans markdown.
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
- Propose entre 10 et 14 milestones. Les repères temporels recommandés incluent : 12, 10, 9, 6, 4, 3, 2, 1.5, 1, 0.5, 0.25, 0 mois avant le mariage (Jour J).
- "tasks" : 2 à 5 items courts, actionnables, en français, formulés à l'impératif.
- Pour chaque milestone, calcule "idealDeadline" (texte "X mois avant le jour J" ou date ISO), "priority" selon l'impact, "urgency" par rapport à la date du mariage, "timeNeeded" (ex: "2-4 semaines"), "consequences" (1 phrase) et "dependencies" (tâches ou milestones dépendants, 1-3 items).
- "status" : "completed" si la milestone est théoriquement terminée avant la date actuelle, "overdue" si elle devrait être terminée et ne l'est pas (pas de recul suffisant), "upcoming" si à venir, "in_progress" si c'est la prochaine phase active.
- Couvre TOUS les aspects : date/lieu, budget, prestataires clés (lieu, traiteur, photo, vidéo, musique), tenue (robe, costume, alliances), beauté (coiffure, maquillage), papeterie (faire-part, plan de table), transport, hébergement, cérémonie (officiant/mairie), gâteau/desserts, démarches administratives (publication des bans, contrat de mariage si besoin), evjf/evg, plan de table, briefing J-1, jour J.
- "globalProgress" : pourcentage estimé d'avancement global basé sur la date actuelle.
- "nextCriticalStep" : titre de la prochaine tâche critique, sa deadline et le nombre de jours restants avant cette deadline.
- Si le niveau de stress déclaré est élevé (>= 8), priorise la délégation et la simplification dans les tasks.
- Si le budget est serré, ajoute des tâches de négociation et d'arbitrages.`;

export function buildTimelineUserPrompt(answers: QuizAnswers): string {
  const now = new Date().toISOString();
  const budgetPerGuest = Math.round((answers.budget?.amount ?? 0) / Math.max(answers.guestCount ?? 1, 1));
  return `Date du mariage : ${answers.weddingDate}
Date actuelle : ${now}
Localisation : ${answers.location?.city}, ${answers.location?.country}
Budget total : ${answers.budget?.amount} ${answers.budget?.currency} (${budgetPerGuest} ${answers.budget?.currency} par invité)
Nombre d'invités : ${answers.guestCount}${answers.childrenCount ? ` (dont ${answers.childrenCount} enfants)` : ""}
Style : ${answers.style ?? "non précisé"} ${answers.customStyleDescription ? `- ${answers.customStyleDescription}` : ""}
Ambiances recherchées : ${answers.ambiance?.length ? answers.ambiance.join(", ") : "non précisé"}
Prestataires recherchés : ${answers.desiredCategories?.length ? answers.desiredCategories.join(", ") : "non précisé"}
Besoins alimentaires spécifiques : ${answers.dietaryNeeds?.length ? answers.dietaryNeeds.join(", ") : "aucun"}
Personnes à mobilité réduite : ${answers.mobilityNeeds ? "oui" : "non précisé"}
Invités venant de loin : ${answers.guestsFromFar ? "oui" : "non précisé"}
Priorité principale : ${answers.mainPriority}
Niveau de stress déclaré (1-10) : ${answers.stressLevel}`;
}
