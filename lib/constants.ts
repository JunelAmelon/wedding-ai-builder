import type { WeddingStyle, MainPriority } from "@/types/domain";

export const STYLE_OPTIONS: { value: WeddingStyle; label: string; imageUrl: string }[] = [
  {
    value: "boheme",
    label: "Bohème",
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "classique",
    label: "Classique & élégant",
    imageUrl:
      "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "moderne",
    label: "Moderne & minimaliste",
    imageUrl:
      "https://images.unsplash.com/photo-1523293836415-74e8f16cfa2a?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "destination",
    label: "Destination wedding",
    imageUrl:
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "rustique",
    label: "Rustique & champêtre",
    imageUrl:
      "https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=900&q=80",
  },
  {
    value: "luxe",
    label: "Luxe & raffiné",
    imageUrl:
      "https://images.unsplash.com/photo-1520962917960-0ac1f0913ca4?auto=format&fit=crop&w=900&q=80",
  },
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
