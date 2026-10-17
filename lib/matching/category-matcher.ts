/**
 * Normalisation et équivalence des catégories de prestataires.
 * Permet d'associer de façon bidirectionnelle les 48 tuiles, les choix du quiz
 * et les catégories enregistrées sur les profils des prestataires.
 */

// Dictionnaire de correspondances sémantiques vers les catégories prestataires réelles
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  // Lieux
  "Lieu de réception": ["Lieu de réception", "lieu", "Domaine mariage", "Château mariage", "Auberge mariage", "Hôtel mariage", "Restaurant mariage", "Salle mariage", "Bateau mariage", "Mariages à la plage", "Chapiteau mariage"],
  "Domaine mariage": ["Domaine mariage", "Lieu de réception", "lieu"],
  "Château mariage": ["Château mariage", "Lieu de réception", "lieu"],
  "Auberge mariage": ["Auberge mariage", "Lieu de réception", "lieu"],
  "Hôtel mariage": ["Hôtel mariage", "Lieu de réception", "hebergement", "Hébergement"],
  "Restaurant mariage": ["Restaurant mariage", "Lieu de réception", "traiteur", "Traiteur"],
  "Salle mariage": ["Salle mariage", "Lieu de réception", "lieu"],
  "Bateau mariage": ["Bateau mariage", "Lieu de réception", "lieu"],
  "Mariages à la plage": ["Mariages à la plage", "Lieu de réception", "lieu"],
  "Chapiteau mariage": ["Chapiteau mariage", "Lieu de réception", "decoration", "Décoration mariage"],
  "Hébergement": ["Hébergement", "hebergement", "Hôtel mariage", "Auberge mariage"],

  // Traiteur & Saveurs
  "Traiteur": ["Traiteur", "traiteur", "Traiteur mariage", "Food Truck"],
  "Traiteur mariage": ["Traiteur mariage", "Traiteur", "traiteur"],
  "Food Truck": ["Food Truck", "Traiteur", "traiteur", "Traiteur mariage"],
  "Wedding cake": ["Wedding cake", "wedding-cake", "Pâtissier"],
  "Vin et Spiritueux": ["Vin et Spiritueux", "Traiteur", "traiteur"],

  // Photo & Vidéo
  "Photographe / Vidéaste": ["Photographe / Vidéaste", "photographe", "videaste", "Photographe", "Vidéaste", "Photo mariage", "Vidéo mariage"],
  "Photo mariage": ["Photo mariage", "Photographe", "photographe", "Photographe / Vidéaste"],
  "Vidéo mariage": ["Vidéo mariage", "Vidéaste", "videaste", "Photographe / Vidéaste"],

  // Musique & Animation
  "Musique / DJ / Orchestre": ["Musique / DJ / Orchestre", "dj", "DJ", "Musique mariage", "Animation", "animation", "Animation mariage"],
  "Musique mariage": ["Musique mariage", "dj", "DJ", "Musique / DJ / Orchestre"],
  "Animation": ["Animation", "animation", "Animation mariage", "Spectacle"],
  "Animation mariage": ["Animation mariage", "animation", "Animation", "Spectacle"],

  // Fleurs & Déco
  "Décoration / Fleuriste": ["Décoration / Fleuriste", "decoration", "fleuriste", "Fleuriste", "Décorateur", "Fleurs mariage", "Décoration mariage"],
  "Fleurs mariage": ["Fleurs mariage", "fleuriste", "Fleuriste", "Décoration / Fleuriste"],
  "Décoration mariage": ["Décoration mariage", "decoration", "Décorateur", "Décoration / Fleuriste"],

  // Organisation
  "Wedding planner": ["Wedding planner", "Wedding Planner", "wedding-planner", "Organisation"],
  "Wedding Planner": ["Wedding Planner", "Wedding planner", "wedding-planner", "Organisation"],

  // Tenues & Alliances
  "Créateur de robes": ["Créateur de robes", "robe", "Robe de mariée", "Robe de cocktail", "Conception de robe de mariée"],
  "Robe de mariée": ["Robe de mariée", "robe", "Créateur de robes"],
  "Robe de cocktail": ["Robe de cocktail", "robe", "Créateur de robes"],
  "Costumes mariage": ["Costumes mariage", "costume", "Costume"],
  "Bijoutier": ["Bijoutier", "alliances", "Bijoux mariage", "Alliances"],
  "Bijoux mariage": ["Bijoux mariage", "alliances", "Bijoutier", "Alliances"],
  "Accessoires mariage": ["Accessoires mariage", "robe", "Bijoutier"],
  "Accessoires marié": ["Accessoires marié", "costume", "Costumes mariage"],

  // Beauté
  "Maquilleur / Coiffeur": ["Maquilleur / Coiffeur", "coiffeuse-maquilleuse", "Esthétique coiffure mariage", "Soins beauté"],
  "Esthétique coiffure mariage": ["Esthétique coiffure mariage", "coiffeuse-maquilleuse", "Maquilleur / Coiffeur"],
  "Soins beauté": ["Soins beauté", "coiffeuse-maquilleuse", "Maquilleur / Coiffeur", "Esthétique coiffure mariage"],

  // Célébrant
  "Officiant": ["Officiant", "officiant", "Officiants"],
  "Officiants": ["Officiants", "officiant", "Officiant"],

  // Papeterie & Cadeaux & Voyage
  "Faire part mariage": ["Faire part mariage", "Faire-part", "Papeterie"],
  "Cadeaux invités mariage": ["Cadeaux invités mariage", "Cadeaux", "animation"],
  "Liste de mariage": ["Liste de mariage", "Cadeaux invités mariage"],
  "Lune de miel": ["Lune de miel", "Voyage", "Voyage de noces"],

  // Transport
  "Transport": ["Transport", "transport", "Voiture mariage", "Bus mariage"],
  "Voiture mariage": ["Voiture mariage", "transport", "Transport"],
  "Bus mariage": ["Bus mariage", "transport", "Transport"],
};

export function areCategoriesMatching(cat1: string, cat2: string): boolean {
  if (!cat1 || !cat2) return false;
  const c1 = cat1.trim().toLowerCase();
  const c2 = cat2.trim().toLowerCase();
  if (c1 === c2) return true;

  // Vérification via la table des synonymes
  const list1 = CATEGORY_SYNONYMS[cat1] || [];
  if (list1.some((s) => s.toLowerCase() === c2)) return true;

  const list2 = CATEGORY_SYNONYMS[cat2] || [];
  if (list2.some((s) => s.toLowerCase() === c1)) return true;

  // Normalisation simplifiée (singulier/pluriel, accents)
  const norm1 = c1.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/s$/, "");
  const norm2 = c2.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/s$/, "");
  return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1);
}
