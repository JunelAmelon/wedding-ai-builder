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

export { VENDOR_CATEGORIES, type VendorCategoryName } from "@/types/domain";

export const CATEGORY_OPTIONS: { value: DesiredCategory; label: string; icon: string }[] = [
  { value: "Domaine mariage", label: "Domaine mariage", icon: "🏡" },
  { value: "Auberge mariage", label: "Auberge mariage", icon: "🏨" },
  { value: "Hôtel mariage", label: "Hôtel mariage", icon: "🏩" },
  { value: "Restaurant mariage", label: "Restaurant mariage", icon: "🍽️" },
  { value: "Salle mariage", label: "Salle mariage", icon: "🏛️" },
  { value: "Château mariage", label: "Château mariage", icon: "🏰" },
  { value: "Bateau mariage", label: "Bateau mariage", icon: "🛥️" },
  { value: "Mariages à la plage", label: "Mariages à la plage", icon: "🏖️" },
  { value: "Traiteur mariage", label: "Traiteur mariage", icon: "🍲" },
  { value: "Wedding cake", label: "Wedding cake", icon: "🎂" },
  { value: "Faire part mariage", label: "Faire part mariage", icon: "💌" },
  { value: "Cadeaux invités mariage", label: "Cadeaux invités mariage", icon: "🎁" },
  { value: "Liste de mariage", label: "Liste de mariage", icon: "📋" },
  { value: "Photo mariage", label: "Photo mariage", icon: "📸" },
  { value: "Vidéo mariage", label: "Vidéo mariage", icon: "🎥" },
  { value: "Musique mariage", label: "Musique mariage", icon: "🎵" },
  { value: "Voiture mariage", label: "Voiture mariage", icon: "🚗" },
  { value: "Bus mariage", label: "Bus mariage", icon: "🚌" },
  { value: "Décoration mariage", label: "Décoration mariage", icon: "🎨" },
  { value: "Fleurs mariage", label: "Fleurs mariage", icon: "💐" },
  { value: "Chapiteau mariage", label: "Chapiteau mariage", icon: "⛺" },
  { value: "Animation mariage", label: "Animation mariage", icon: "🎪" },
  { value: "Wedding Planner", label: "Wedding Planner", icon: "💍" },
  { value: "Lune de miel", label: "Lune de miel", icon: "✈️" },
  { value: "Officiants", label: "Officiants", icon: "⛪" },
  { value: "Food Truck", label: "Food Truck", icon: "🚚" },
  { value: "Vin et Spiritueux", label: "Vin et Spiritueux", icon: "🍷" },
  { value: "Bijoux mariage", label: "Bijoux mariage", icon: "💎" },
  { value: "Robe de mariée", label: "Robe de mariée", icon: "👗" },
  { value: "Accessoires mariage", label: "Accessoires mariage", icon: "🎀" },
  { value: "Robe de cocktail", label: "Robe de cocktail", icon: "💃" },
  { value: "Esthétique coiffure mariage", label: "Esthétique coiffure mariage", icon: "💄" },
  { value: "Costumes mariage", label: "Costumes mariage", icon: "🤵" },
  { value: "Soins beauté", label: "Soins beauté", icon: "✨" },
  { value: "Accessoires marié", label: "Accessoires marié", icon: "👔" },
];

export interface VendorCategoryGroup {
  id: string;
  label: string;
  icon: string;
  badgeBg: string;
  badgeColor: string;
  categories: {
    value: DesiredCategory;
    label: string;
    icon: string;
  }[];
}

export const VENDOR_CATEGORY_GROUPS: VendorCategoryGroup[] = [
  {
    id: "lieux",
    label: "Lieux",
    icon: "🏰",
    badgeBg: "#D8ECD9",
    badgeColor: "#2A6B3E",
    categories: [
      { value: "Domaine mariage", label: "Domaine mariage", icon: "🏡" },
      { value: "Château mariage", label: "Château mariage", icon: "🏰" },
      { value: "Salle mariage", label: "Salle mariage", icon: "🏛️" },
      { value: "Hôtel mariage", label: "Hôtel mariage", icon: "🏩" },
      { value: "Auberge mariage", label: "Auberge mariage", icon: "🏨" },
      { value: "Restaurant mariage", label: "Restaurant mariage", icon: "🍽️" },
      { value: "Bateau mariage", label: "Bateau mariage", icon: "🛥️" },
      { value: "Mariages à la plage", label: "Mariages à la plage", icon: "🏖️" },
      { value: "Chapiteau mariage", label: "Chapiteau mariage", icon: "⛺" },
    ],
  },
  {
    id: "gastronomie",
    label: "Traiteur & Boissons",
    icon: "🍽️",
    badgeBg: "#FEF3C7",
    badgeColor: "#92400E",
    categories: [
      { value: "Traiteur mariage", label: "Traiteur mariage", icon: "🍲" },
      { value: "Wedding cake", label: "Wedding cake", icon: "🎂" },
      { value: "Food Truck", label: "Food Truck", icon: "🚚" },
      { value: "Vin et Spiritueux", label: "Vin et Spiritueux", icon: "🍷" },
    ],
  },
  {
    id: "souvenirs",
    label: "Photo & Vidéo",
    icon: "📸",
    badgeBg: "#E4DBFB",
    badgeColor: "#5B4FC4",
    categories: [
      { value: "Photo mariage", label: "Photo mariage", icon: "📸" },
      { value: "Vidéo mariage", label: "Vidéo mariage", icon: "🎥" },
    ],
  },
  {
    id: "ambiance",
    label: "Musique & Célébration",
    icon: "🎵",
    badgeBg: "#FBE1E6",
    badgeColor: "#C43A4A",
    categories: [
      { value: "Musique mariage", label: "Musique mariage", icon: "🎵" },
      { value: "Animation mariage", label: "Animation mariage", icon: "🎪" },
      { value: "Wedding Planner", label: "Wedding Planner", icon: "💍" },
      { value: "Officiants", label: "Officiants", icon: "⛪" },
    ],
  },
  {
    id: "beaute",
    label: "Tenues & Beauté",
    icon: "👗",
    badgeBg: "#FBE1E6",
    badgeColor: "#9D174D",
    categories: [
      { value: "Robe de mariée", label: "Robe de mariée", icon: "👗" },
      { value: "Costumes mariage", label: "Costumes mariage", icon: "🤵" },
      { value: "Robe de cocktail", label: "Robe de cocktail", icon: "💃" },
      { value: "Esthétique coiffure mariage", label: "Esthétique coiffure mariage", icon: "💄" },
      { value: "Soins beauté", label: "Soins beauté", icon: "✨" },
      { value: "Bijoux mariage", label: "Bijoux mariage", icon: "💎" },
      { value: "Accessoires mariage", label: "Accessoires mariage", icon: "🎀" },
      { value: "Accessoires marié", label: "Accessoires marié", icon: "👔" },
    ],
  },
  {
    id: "decoration",
    label: "Déco & Papeterie",
    icon: "🎨",
    badgeBg: "#D8ECD9",
    badgeColor: "#166534",
    categories: [
      { value: "Décoration mariage", label: "Décoration mariage", icon: "🎨" },
      { value: "Fleurs mariage", label: "Fleurs mariage", icon: "💐" },
      { value: "Faire part mariage", label: "Faire part mariage", icon: "💌" },
      { value: "Cadeaux invités mariage", label: "Cadeaux invités mariage", icon: "🎁" },
      { value: "Liste de mariage", label: "Liste de mariage", icon: "📋" },
    ],
  },
  {
    id: "transport",
    label: "Transport & Voyage",
    icon: "🚗",
    badgeBg: "#E4DBFB",
    badgeColor: "#4338CA",
    categories: [
      { value: "Voiture mariage", label: "Voiture mariage", icon: "🚗" },
      { value: "Bus mariage", label: "Bus mariage", icon: "🚌" },
      { value: "Lune de miel", label: "Lune de miel", icon: "✈️" },
    ],
  },
];

