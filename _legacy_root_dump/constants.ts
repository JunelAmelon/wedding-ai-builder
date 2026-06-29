import type { WeddingStyle, MainPriority } from "@/types/domain";

export const STYLE_OPTIONS: { value: WeddingStyle; label: string; emoji: string }[] = [
  { value: "boheme", label: "Bohème", emoji: "🌾" },
  { value: "classique", label: "Classique & élégant", emoji: "🤍" },
  { value: "moderne", label: "Moderne & minimaliste", emoji: "⬛" },
  { value: "destination", label: "Destination Wedding", emoji: "✈️" },
  { value: "rustique", label: "Rustique & champêtre", emoji: "🌿" },
  { value: "luxe", label: "Luxe & raffiné", emoji: "💎" },
];

export const PRIORITY_OPTIONS: { value: MainPriority; label: string }[] = [
  { value: "budget", label: "Maîtriser le budget" },
  { value: "lieu", label: "Trouver le lieu parfait" },
  { value: "invites", label: "Gérer les invités" },
  { value: "stress", label: "Réduire le stress" },
  { value: "deco", label: "Soigner la décoration" },
];

export const CURRENCY_OPTIONS = ["EUR", "USD", "XOF", "CAD", "CHF"];

export const TOTAL_QUIZ_STEPS = 7;
