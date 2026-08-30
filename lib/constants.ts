import type { WeddingStyle, MainPriority, Ambiance, DietaryNeed, DesiredCategory } from "@/types/domain";

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
  { value: "prestataires", label: "Trouver les bons prestataires" },
  { value: "invites", label: "Gérer les invités" },
  { value: "deco", label: "Soigner la décoration" },
  { value: "coordination", label: "Coordonner le jour J" },
  { value: "stress", label: "Réduire le stress" },
];

export const CURRENCY_OPTIONS = ["EUR", "USD", "XOF", "CAD", "CHF"];

export const TOTAL_QUIZ_STEPS = 9;

export const AMBIANCE_OPTIONS: { value: Ambiance; label: string }[] = [
  { value: "chic", label: "Chic" },
  { value: "romantique", label: "Romantique" },
  { value: "festif", label: "Festif" },
  { value: "intimiste", label: "Intimiste" },
  { value: "prestige", label: "Prestige" },
  { value: "traditionnel", label: "Traditionnel" },
  { value: "creatif", label: "Créatif" },
];

export const DIETARY_OPTIONS: { value: DietaryNeed; label: string }[] = [
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "casher", label: "Casher" },
  { value: "sans-gluten", label: "Sans gluten" },
  { value: "allergies", label: "Allergies spécifiques" },
  { value: "autre", label: "Autre régime" },
];

export const CATEGORY_OPTIONS: { value: DesiredCategory; label: string; icon: string }[] = [
  { value: "lieu", label: "Lieu de réception", icon: "🏛️" },
  { value: "traiteur", label: "Traiteur", icon: "🍽️" },
  { value: "photographe", label: "Photographe", icon: "📸" },
  { value: "videaste", label: "Vidéaste", icon: "🎥" },
  { value: "dj", label: "DJ / Animation musicale", icon: "🎧" },
  { value: "fleuriste", label: "Fleuriste", icon: "💐" },
  { value: "wedding-cake", label: "Wedding cake", icon: "🎂" },
  { value: "coiffeuse-maquilleuse", label: "Coiffeuse / Maquilleuse", icon: "💄" },
  { value: "transport", label: "Transport / Véhicule", icon: "🚗" },
  { value: "hebergement", label: "Hébergement invités", icon: "🏨" },
  { value: "alliances", label: "Alliances", icon: "💍" },
  { value: "robe", label: "Robe de mariée", icon: "👗" },
  { value: "costume", label: "Costume", icon: "🤵" },
  { value: "decoration", label: "Décoration", icon: "🎨" },
  { value: "officiant", label: "Officiant de cérémonie", icon: "⛪" },
  { value: "animation", label: "Animations", icon: "🎉" },
];
