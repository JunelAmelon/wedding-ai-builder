/**
 * Calculateur unifié des dates cibles pour les jalons et tâches
 * Partagé entre la Frise Chronologique (/result) et le Calendrier (/planning)
 * pour garantir une concordance temporelle absolue à 100%.
 */

export function computeMilestoneTargetDate(
  baseWeddingDate: Date,
  monthsBefore: number,
  milestoneIndex: number,
  totalCount: number,
  maxDeclaredMonths: number,
  today: Date = new Date()
): Date {
  const wedding = new Date(baseWeddingDate);
  wedding.setHours(0, 0, 0, 0);

  const curToday = new Date(today);
  curToday.setHours(0, 0, 0, 0);

  if (monthsBefore <= 0) {
    return wedding; // Jour J
  }

  // Nombre total de jours réels restants entre aujourd'hui et le mariage
  const totalDaysRemaining = Math.max(
    1,
    Math.round((wedding.getTime() - curToday.getTime()) / (1000 * 60 * 60 * 24))
  );

  const safeMaxMonths = Math.max(maxDeclaredMonths, 1);

  // Si le mariage est plus proche que le jalon le plus éloigné (ex: mariage dans 6 mois mais jalon à 12 mois)
  // on compresse proportionnellement l'échéancier entre AUJOURD'HUI et le Jour J (planning adaptatif)
  let daysBefore: number;
  if (safeMaxMonths * 30.4375 > totalDaysRemaining) {
    const ratio = monthsBefore / safeMaxMonths;
    daysBefore = Math.round(ratio * (totalDaysRemaining - 1));
  } else {
    // Cas standard : plus de 12 mois devant le couple
    const baseDays = Math.round(monthsBefore * 30.4375);
    const staggerDays = ((milestoneIndex % 4) - 1.5) * 2;
    daysBefore = Math.round(baseDays + staggerDays);
  }

  const maxAllowedDaysBefore = Math.max(0, totalDaysRemaining - 1);
  const safeDaysBefore = Math.min(daysBefore, maxAllowedDaysBefore);

  const target = new Date(wedding);
  target.setDate(target.getDate() - safeDaysBefore);
  target.setHours(0, 0, 0, 0);

  if (target < curToday) {
    const adjusted = new Date(curToday);
    adjusted.setDate(adjusted.getDate() + milestoneIndex);
    return adjusted;
  }

  return target;
}
