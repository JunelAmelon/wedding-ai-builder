// scripts/seed-real-test-data.ts
// Script de peuplement de données réelles pour tester tous les workflows (couple & prestataires)

import { randomBytes, pbkdf2Sync } from "crypto";
import { userRepo } from "../lib/db/repositories/userRepo";
import { coupleProfileRepo } from "../lib/db/repositories/coupleProfileRepo";
import { vendorProfileRepo } from "../lib/db/repositories/vendorProfileRepo";
import { projectRepo } from "../lib/db/repositories/projectRepo";
import { tenderRepo } from "../lib/db/repositories/tenderRepo";
import { proposalRepo } from "../lib/db/repositories/proposalRepo";
import { matchRepo } from "../lib/db/repositories/matchRepo";
import { adminRepo } from "../lib/db/repositories/adminRepo";
import { localStore } from "../lib/db/localStore";
import type { UserAccount, VendorProfile, WeddingProject } from "../types/marketplace";

try {
  process.loadEnvFile(".env");
} catch {
  // Ignorer si pas de .env
}

const DEFAULT_PASSWORD = "Password123!";
const now = new Date().toISOString();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function createOrUpdateUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: "couple" | "vendor" | "admin";
  phone?: string;
  city?: string;
}) {
  let user = await userRepo.getByEmail(data.email);
  if (!user) {
    user = await userRepo.create({
      email: data.email,
      passwordHash: hashPassword(DEFAULT_PASSWORD),
      googleId: null,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: null,
      phone: data.phone || "06 12 34 56 78",
      address: data.city ? `${data.city}, France` : "Paris, France",
      role: data.role,
      stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
      stripeSubscriptionId: null,
      emailVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
      resetToken: null,
      resetTokenExpiry: null,
    });
  }
  return user;
}

// -------------------------------------------------------------
// LISTE DES 24 PRESTATAIRES PROFESSIONNELS DE TEST
// -------------------------------------------------------------
const REAL_VENDORS_DATA = [
  {
    category: "Château mariage",
    subCategories: ["Lieu de réception", "Domaine mariage"],
    companyName: "Château de Montmirail",
    brandName: "Domaine de Montmirail",
    email: "contact@chateau-montmirail.fr",
    firstName: "Éléonore",
    lastName: "de Montmirail",
    phone: "01 34 56 78 90",
    city: "Chantilly",
    zipCode: "60500",
    priceRange: { min: 4500, max: 9500, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop",
    description: "Écrin d'exception du XVIIIe siècle au cœur d'un parc boisé de 15 hectares. Le Château de Montmirail vous accueille pour des réceptions féeriques avec orangerie lumineuse, salons d'époque classés, suite nuptiale panoramique et hébergement de 45 couchages sur place.",
    styles: ["classique", "chic", "romantique"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Camille & Maxime", rating: 5, text: "Un lieu magique qui a subjugué tous nos invités. L'équipe a été aux petits soins du début à la fin !", date: "2026-09-12" },
      { author: "Julie & Pierre", rating: 5, text: "Le parc à la tombée de la nuit avec les lumières était juste grandiose. Merci mille fois.", date: "2026-08-04" },
    ],
  },
  {
    category: "Domaine mariage",
    subCategories: ["Lieu de réception", "Salle mariage"],
    companyName: "Le Domaine des Oliviers",
    brandName: "Domaine des Oliviers Provence",
    email: "contact@domainedesoliviers.fr",
    firstName: "Julien",
    lastName: "Roustan",
    phone: "04 42 12 34 56",
    city: "Aix-en-Provence",
    zipCode: "13100",
    priceRange: { min: 3800, max: 7500, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    description: "Bastide provençale authentique entourée d'oliviers centenaires et de lavandes. Vue imprenable sur la Sainte-Victoire, cour ombragée pour le cocktail et grange réhabilitée aux pierres blondes climatisée.",
    styles: ["boheme", "champetre", "nature"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Sarah & Lucas", rating: 5, text: "Un cadre de rêve pour notre mariage bohème. Tous nos invités nous en parlent encore !", date: "2026-07-20" },
    ],
  },
  {
    category: "Bateau mariage",
    subCategories: ["Lieu de réception"],
    companyName: "Péniche Étoile de Seine",
    brandName: "Étoile de Seine Croisières",
    email: "evenements@etoile-seine.fr",
    firstName: "Marc",
    lastName: "Leblanc",
    phone: "01 45 67 89 01",
    city: "Paris",
    zipCode: "75007",
    priceRange: { min: 3500, max: 8000, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
    description: "Célébrez votre union au fil de l'eau avec vue imprenable sur la Tour Eiffel et Notre-Dame. Rooftop panoramique pour le vin d'honneur et salon de réception vitré haut de gamme.",
    styles: ["chic", "moderne", "original"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Léa & Thomas", rating: 5, text: "La croisière de nuit devant Paris illuminé a rendu notre mariage inoubliable.", date: "2026-09-02" },
    ],
  },
  {
    category: "Traiteur mariage",
    subCategories: ["Traiteur"],
    companyName: "L'Atelier Gourmet Traiteur",
    brandName: "Atelier Gourmet Paris",
    email: "contact@atelier-gourmet.fr",
    firstName: "Chef Sébastien",
    lastName: "Mercier",
    phone: "01 42 33 44 55",
    city: "Paris",
    zipCode: "75011",
    priceRange: { min: 85, max: 160, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop",
    description: "Cuisine gastronomique raffinée et inventive à partir de produits frais, bio et de saison en circuit court. Maîtres d'hôtel attentionnés, animations culinaires en direct (bar à huîtres, découpe de jambon ibérique, plancha minute).",
    styles: ["gastronomique", "raffine", "eco-responsable"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Chloé & Alexandre", rating: 5, text: "Les plats étaient non seulement magnifiques mais absolument délicieux. Un sans-faute !", date: "2026-09-28" },
      { author: "Emma & David", rating: 5, text: "Le service était d'une efficacité et d'une discrétion remarquables.", date: "2026-08-15" },
    ],
  },
  {
    category: "Food Truck",
    subCategories: ["Traiteur mariage"],
    companyName: "Le Truck des Mariés",
    brandName: "Gourmet Truck & Co",
    email: "bonjour@letruckdesmaries.fr",
    firstName: "Romain",
    lastName: "Gautier",
    phone: "06 98 76 54 32",
    city: "Versailles",
    zipCode: "78000",
    priceRange: { min: 25, max: 60, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop",
    description: "Food Truck vintage Citroën HY rénové. Burgers gourmets au bœuf charolais, frites fraîches maison, crêpes & gaufres minute pour le brunch du lendemain ou un cocktail décontracté et festif.",
    styles: ["retro", "vintage", "convivial"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Pauline & Matthieu", rating: 5, text: "Le brunch du dimanche au camion a ravi tout le monde, ambiance hyper détendue !", date: "2026-09-18" },
    ],
  },
  {
    category: "Wedding cake",
    subCategories: ["Pâtissier"],
    companyName: "Sweet Couture Wedding Cakes",
    brandName: "Sweet Couture Pâtisserie",
    email: "contact@sweetcouture-cakes.fr",
    firstName: "Aurélie",
    lastName: "Dumont",
    phone: "06 11 22 33 44",
    city: "Boulogne-Billancourt",
    zipCode: "92100",
    priceRange: { min: 450, max: 1200, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop",
    description: "Créatrice de wedding cakes spectaculaires et légers, pièces montées modernes et tables de douceurs. Fleurs en sucre faites main, saveurs subtiles (framboise-litchi, pistache-fleur d'oranger, chocolat praliné croustillant).",
    styles: ["romantique", "raffine", "design"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Marie & Simon", rating: 5, text: "Le gâteau était une œuvre d'art et d'une légèreté incroyable en fin de repas.", date: "2026-08-22" },
    ],
  },
  {
    category: "Photo mariage",
    subCategories: ["Photographe / Vidéaste"],
    companyName: "Lumière & Émotion Photographie",
    brandName: "Lumière d'Amour Studio",
    email: "contact@lumieredamour-photo.fr",
    firstName: "Alexandre",
    lastName: "Chevalier",
    phone: "06 45 12 89 74",
    city: "Paris",
    zipCode: "75003",
    priceRange: { min: 1400, max: 2800, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop",
    description: "Photographe de mariage passionné depuis 9 ans, style Fine Art lumineux et spontané. Je capture vos rires, vos larmes d'émotion et les petits détails précieux sur le vif sans poses figées.",
    styles: ["fine-art", "naturel", "lumineux", "reportage"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Inès & Julien", rating: 5, text: "Alexandre a su nous mettre en confiance dès la première minute. Les photos sont à couper le souffle !", date: "2026-09-05" },
      { author: "Manon & Hugo", rating: 5, text: "Chaque photo retranscrit parfaitement l'émotion de notre journée.", date: "2026-07-14" },
    ],
  },
  {
    category: "Vidéo mariage",
    subCategories: ["Photographe / Vidéaste"],
    companyName: "Cinéma du Cœur Vidéaste",
    brandName: "Cinéma du Cœur Films",
    email: "films@cinemaducoeur.fr",
    firstName: "Nicolas",
    lastName: "Vidal",
    phone: "06 55 44 33 22",
    city: "Lyon",
    zipCode: "69002",
    priceRange: { min: 1500, max: 3200, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
    description: "Films de mariage cinématographiques tournés en 4K avec prise de son haute fidélité et plans aériens au drone homologué. Un véritable film souvenir digne du grand écran pour revivre votre jour J.",
    styles: ["cinematographique", "emouvant", "moderne"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Céline & Damien", rating: 5, text: "Nous avons pleuré en redécouvrant notre film. Un travail d'artiste d'une qualité rare.", date: "2026-08-30" },
    ],
  },
  {
    category: "Musique mariage",
    subCategories: ["Musique / DJ / Orchestre"],
    companyName: "Sound & Light Events Paris",
    brandName: "DJ Sound & Light",
    email: "booking@soundandlight-mariage.fr",
    firstName: "Antoine",
    lastName: "Moreau",
    phone: "06 77 88 99 00",
    city: "Paris",
    zipCode: "75010",
    priceRange: { min: 1100, max: 2400, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
    description: "DJ généraliste professionnel avec sono haut de gamme L-Acoustics et mise en lumière architecturale sans fil de votre salle. Playlist 100% sur mesure adaptée à vos goûts, sans micro intempestif.",
    styles: ["festif", "chic", "generaliste", "dance"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Laura & Quentin", rating: 5, text: "La piste de danse n'a pas désempli jusqu'à 5h du matin ! Antoine est un pro absolu.", date: "2026-09-14" },
    ],
  },
  {
    category: "Robe de mariée",
    subCategories: ["Créateur de robes", "Accessoires mariage"],
    companyName: "Maison Blanche Atelier Couture",
    brandName: "Maison Blanche Mariée",
    email: "contact@maisonblanche-mariee.fr",
    firstName: "Victoire",
    lastName: "Renard",
    phone: "01 43 25 67 89",
    city: "Paris",
    zipCode: "75006",
    priceRange: { min: 1800, max: 4500, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&auto=format&fit=crop",
    description: "Créations sur mesure et collections exclusives de robes de mariée fluides et poétiques. Dentelles de Calais, crêpe de soie italienne et broderies d'art confectionnées à Paris.",
    styles: ["boheme", "romantique", "epure", "haute-couture"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Clara & Benjamin", rating: 5, text: "Ma robe était sublime, confortable et exactement comme je l'avais rêvée.", date: "2026-07-29" },
    ],
  },
  {
    category: "Costumes mariage",
    subCategories: ["Costumes mariage", "Accessoires marié"],
    companyName: "Atelier Victor & Fils Tailleur",
    brandName: "Victor Tailleur Paris",
    email: "surmesure@victor-tailleur.fr",
    firstName: "Victor",
    lastName: "Carpentier",
    phone: "01 42 68 11 22",
    city: "Paris",
    zipCode: "75009",
    priceRange: { min: 750, max: 2200, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop",
    description: "Tailleur traditionnel pour hommes. Costumes de mariage sur-mesure, smokings et jaquettes taillés dans les plus belles laines et lins d'Italie et de Grande-Bretagne. Conseils personnalisés et retouches illimitées.",
    styles: ["dandy", "classique", "moderne", "sur-mesure"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Romain & Sophie", rating: 5, text: "Coupe impeccable, tissu d'une grande noblesse et service irréprochable.", date: "2026-08-11" },
    ],
  },
  {
    category: "Fleurs mariage",
    subCategories: ["Décoration / Fleuriste", "Décoration mariage"],
    companyName: "L'Atelier Floral Sauvage",
    brandName: "Fleurs Sauvages Paris",
    email: "contact@fleurs-sauvages.fr",
    firstName: "Camille",
    lastName: "Benoit",
    phone: "06 23 45 67 89",
    city: "Paris",
    zipCode: "75018",
    priceRange: { min: 800, max: 3500, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1561128290-006dc4827214?w=800&auto=format&fit=crop",
    description: "Fleuriste éco-engagée travaillant exclusivement des fleurs françaises de saison. Arches florales suspendues, centres de tables bucoliques, boutonnières et bouquets de mariée aériens et vibrants.",
    styles: ["champetre", "boheme", "sauvage", "eco-responsable"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1561128290-006dc4827214?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Agathe & Louis", rating: 5, text: "L'arche de cérémonie était encore plus belle que sur mes tableaux Pinterest !", date: "2026-09-21" },
    ],
  },
  {
    category: "Wedding Planner",
    subCategories: ["Wedding planner"],
    companyName: "Harmonie & Étoiles Événements",
    brandName: "Harmonie Événements",
    email: "contact@harmonie-etoiles.fr",
    firstName: "Claire",
    lastName: "Lefebvre",
    phone: "06 33 22 11 00",
    city: "Paris",
    zipCode: "75008",
    priceRange: { min: 2500, max: 6000, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
    description: "Agence d'organisation de mariage sur mesure. De la recherche de prestataires à la coordination millimétrée du Jour J, nous gérons chaque détail pour vous faire vivre des préparatifs 100% sereins.",
    styles: ["raffine", "haut-de-gamme", "sur-mesure"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Diane & Édouard", rating: 5, text: "Claire a fait de notre journée un conte de fées sans aucun stress. Meilleure décision de notre mariage.", date: "2026-07-07" },
    ],
  },
  {
    category: "Voiture mariage",
    subCategories: ["Transport"],
    companyName: "Vintage Prestige Voitures de Cérémonie",
    brandName: "Prestige Vintage Car",
    email: "contact@prestige-vintagecar.fr",
    firstName: "Gérard",
    lastName: "Dubois",
    phone: "01 39 50 60 70",
    city: "Versailles",
    zipCode: "78000",
    priceRange: { min: 400, max: 1200, currency: "EUR" },
    logo: "https://images.pexels.com/photos/29624024/pexels-photo-29624024.jpeg",
    description: "Location de voitures de collection d'époque avec chauffeur en tenue de livrée. Rolls-Royce Silver Cloud, Jaguar MK2, Combi Volkswagen rétro et décapotables mythiques.",
    styles: ["vintage", "retro", "prestige"],
    portfolioImages: [
      "https://images.pexels.com/photos/29624024/pexels-photo-29624024.jpeg",
    ],
    reviews: [
      { author: "Sabrina & Kevin", rating: 5, text: "L'arrivée en Rolls blanche était magique, le chauffeur d'une gentillesse absolue.", date: "2026-08-18" },
    ],
  },
  {
    category: "Esthétique coiffure mariage",
    subCategories: ["Maquilleur / Coiffeur", "Soins beauté"],
    companyName: "Élégance & Beauté Studio Mariée",
    brandName: "Élégance Beauté Paris",
    email: "contact@elegancebeaute-mariage.fr",
    firstName: "Nathalie",
    lastName: "Girard",
    phone: "06 44 55 66 77",
    city: "Neuilly-sur-Seine",
    zipCode: "92200",
    priceRange: { min: 250, max: 700, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop",
    description: "Artiste coiffeuse et maquilleuse professionnelle diplômée d'État, spécialisée dans la mise en beauté de la mariée et de ses témoins. Déplacement sur votre lieu de préparatifs.",
    styles: ["naturel", "glamour", "lumineux"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Audrey & Florent", rating: 5, text: "Maquillage impeccable qui a tenu toute la nuit malgré les larmes de joie !", date: "2026-09-10" },
    ],
  },
  {
    category: "Bijoux mariage",
    subCategories: ["Bijoutier"],
    companyName: "Maison Céleste Joaillerie Éthique",
    brandName: "Maison Céleste Alliances",
    email: "joaillerie@maison-celeste.fr",
    firstName: "Édouard",
    lastName: "Lambert",
    phone: "01 42 61 70 80",
    city: "Paris",
    zipCode: "75001",
    priceRange: { min: 600, max: 3000, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop",
    description: "Alliances et bagues de fiançailles forgées à la main à Paris en or 18k recyclé et platine certifié Fairmined. Gravures sur-mesure et pierres précieuses tracées.",
    styles: ["epure", "intemporel", "artisanal"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Chloé & Bastien", rating: 5, text: "Nos alliances sont magnifiques et ont une vraie âme grâce au travail d'Édouard.", date: "2026-06-25" },
    ],
  },
  {
    category: "Officiants",
    subCategories: ["Officiant"],
    companyName: "Cérémonie du Cœur - Célébrant Laïque",
    brandName: "Cérémonie du Cœur",
    email: "contact@ceremonieducoeur.fr",
    firstName: "Béatrice",
    lastName: "Faure",
    phone: "06 78 90 12 34",
    city: "Paris",
    zipCode: "75014",
    priceRange: { min: 700, max: 1500, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop",
    description: "Officiante de cérémonies laïques personnalisées, chaleureuses et vibrantes d'émotion. Écriture de votre histoire d'amour, rituels symboliques personnalisés et coordination des interventions des proches.",
    styles: ["emouvant", "authentique", "personnalise"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Virginie & Romain", rating: 5, text: "Tous nos invités ont versé leur larme et ont ri. Une cérémonie inoubliable.", date: "2026-09-08" },
    ],
  },
  {
    category: "Animation mariage",
    subCategories: ["Animation"],
    companyName: "Magie & Rires - Animation Événementielle",
    brandName: "Magie & Rires Events",
    email: "contact@magie-rires.fr",
    firstName: "Maxime",
    lastName: "Garnier",
    phone: "06 88 99 00 11",
    city: "Paris",
    zipCode: "75015",
    priceRange: { min: 600, max: 1800, currency: "EUR" },
    logo: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
    description: "Magicien close-up de renom et mentaliste pour le cocktail, photobooth vintage en bois avec tirages illimités et animations enfants avec animateurs diplômés BAFA.",
    styles: ["ludique", "surprenant", "interactif"],
    portfolioImages: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop",
    ],
    reviews: [
      { author: "Sandra & Yann", rating: 5, text: "La magie rapprochée pendant le cocktail a brisé la glace entre toutes les familles !", date: "2026-08-01" },
    ],
  },
];

async function seedRealTestData() {
  console.log("🚀 Début du peuplement des vrais comptes de test...\n");

  // 1. CRÉATION DU COMPTE COUPLE TEST
  console.log("💍 1. Création du compte couple de test (Sophie & Thomas)...");
  const coupleUser = await createOrUpdateUser({
    email: "sophie.thomas@test.fr",
    firstName: "Sophie",
    lastName: "Martin",
    role: "couple",
    phone: "06 99 88 77 66",
    city: "Paris",
  });

  let coupleProfile = await coupleProfileRepo.getByUserId(coupleUser.id);
  if (!coupleProfile) {
    coupleProfile = await coupleProfileRepo.create({
      userId: coupleUser.id,
      weddingDate: "2027-06-19",
      location: { city: "Paris", country: "France", geo: { lat: 48.8566, lng: 2.3522 } },
      guestCount: 120,
      budget: { amount: 35000, currency: "EUR" },
      style: "boheme",
      customStyle: null,
      customStyleDescription: "Mariage champêtre chic et bohème dans un domaine avec parc arboré.",
      mainPriority: "ambiance",
      stressLevel: 2,
      favoriteVendorIds: [],
    });
  }

  // Projet de mariage associé
  const existingProjects = await projectRepo.listByUser(coupleUser.id);
  let project: WeddingProject;
  if (existingProjects.length > 0) {
    project = existingProjects[0];
    await projectRepo.update(project.id, {
      name: "Mariage de Sophie & Thomas",
      weddingDate: "2027-06-19",
      guestCount: 120,
      budget: { amount: 35000, currency: "EUR" },
      style: "boheme",
      desiredCategories: [
        "Domaine mariage",
        "Château mariage",
        "Traiteur mariage",
        "Photo mariage",
        "Vidéo mariage",
        "Musique mariage",
        "Fleurs mariage",
        "Robe de mariée",
        "Costumes mariage",
        "Wedding cake",
        "Wedding Planner",
        "Voiture mariage",
        "Animation mariage",
        "Esthétique coiffure mariage",
        "Officiants",
        "Food Truck",
        "Bijoux mariage",
        "Vin et Spiritueux",
      ],
    });
  } else {
    project = await projectRepo.create({
      userId: coupleUser.id,
      coupleProfileId: coupleProfile.id,
      sessionId: null,
      name: "Mariage de Sophie & Thomas",
      weddingDate: "2027-06-19",
      location: { city: "Paris", country: "France", geo: { lat: 48.8566, lng: 2.3522 } },
      guestCount: 120,
      childrenCount: 8,
      budget: { amount: 35000, currency: "EUR" },
      style: "boheme",
      customStyle: null,
      customStyleDescription: "Mariage champêtre chic et bohème dans un domaine avec parc arboré.",
      ambiance: ["Festive", "Bucolique", "Élégante"],
      desiredCategories: [
        "Domaine mariage",
        "Château mariage",
        "Traiteur mariage",
        "Photo mariage",
        "Vidéo mariage",
        "Musique mariage",
        "Fleurs mariage",
        "Robe de mariée",
        "Costumes mariage",
        "Wedding cake",
        "Wedding Planner",
        "Voiture mariage",
        "Animation mariage",
        "Esthétique coiffure mariage",
        "Officiants",
        "Food Truck",
        "Bijoux mariage",
        "Vin et Spiritueux",
      ],
      dietaryNeeds: ["Végétarien", "Sans gluten"],
      dietaryDetails: "Prévoir 15 menus végétariens et 4 sans gluten",
      mobilityNeeds: false,
      guestsFromFar: true,
      mainPriority: "ambiance",
      stressLevel: 2,
    });
  }
  console.log(`✅ Compte couple créé/mis à jour : ${coupleUser.email} (Projet: ${project.name})\n`);

  // 2. CRÉATION DES PRESTATAIRES
  console.log(`🏰 2. Création de ${REAL_VENDORS_DATA.length} prestataires professionnels avec profils et portfolios...`);
  const createdVendors: { profile: VendorProfile; user: UserAccount }[] = [];

  for (const vData of REAL_VENDORS_DATA) {
    const vUser = await createOrUpdateUser({
      email: vData.email,
      firstName: vData.firstName,
      lastName: vData.lastName,
      role: "vendor",
      phone: vData.phone,
      city: vData.city,
    });

    let vProfile = await vendorProfileRepo.getByUserId(vUser.id);
    const profilePayload = {
      userId: vUser.id,
      status: "approved" as const,
      companyName: vData.companyName,
      siret: "1234567890" + Math.floor(1000 + Math.random() * 9000),
      brandName: vData.brandName,
      email: vData.email,
      phone: vData.phone,
      website: `https://www.${vData.brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}.fr`,
      address: {
        street: "12 avenue de la République",
        city: vData.city,
        zipCode: vData.zipCode,
        country: "France",
        geo: { lat: 48.8566 + (Math.random() - 0.5) * 0.2, lng: 2.3522 + (Math.random() - 0.5) * 0.2 },
      },
      serviceCategory: vData.category,
      otherCategory: null,
      logo: { url: vData.logo, publicId: `logo-${vUser.id}`, filename: "logo.jpg" },
      yearsOfExperience: 8,
      trainingDate: "2018-05-12",
      trainingDescription: "Certification professionnelle d'artisanat événementiel et mariage",
      description: vData.description,
      styles: vData.styles,
      contactName: `${vData.firstName} ${vData.lastName}`,
      contactRole: "Dirigeant & Responsable Mariages",
      priceRange: vData.priceRange,
      pricingDetails: "Devis personnalisé gratuit sur rendez-vous ou appel d'offres",
      serviceArea: {
        regions: ["Île-de-France", "Centre-Val de Loire", "Normandie", "Provence-Alpes-Côte d'Azur"],
        cities: [vData.city, "Paris", "Versailles", "Fontainebleau"],
        radius: 120,
        travelPolicy: "Frais de déplacement inclus jusqu'à 80 km",
        geo: { lat: 48.8566, lng: 2.3522 },
      },
      availability: {
        noticePeriod: "3 mois",
        peakSeasons: ["mai", "juin", "juillet", "août", "septembre"],
        unavailableDates: [],
      },
      portfolio: {
        images: vData.portfolioImages.map((url, idx) => ({
          url,
          publicId: `portfolio-${vUser.id}-${idx}`,
          filename: `photo-${idx}.jpg`,
        })),
        website: `https://www.${vData.brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}.fr`,
        instagram: `@${vData.brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}_mariage`,
        videos: [],
        faq: [
          { question: "Quel est le montant de l'acompte à la réservation ?", answer: "Nous demandons un acompte de 30% à la signature du contrat pour bloquer définitivement votre date." },
          { question: "Proposez-vous un premier rendez-vous de découverte ?", answer: "Oui, nous vous offrons un premier échange en visio ou sur place pour faire connaissance et écouter vos envies." },
          { question: "Avez-vous une assurance professionnelle ?", answer: "Absolument, nous disposons d'une assurance Responsabilité Civile Professionnelle complète." },
        ],
        reviews: vData.reviews,
        googleBusiness: {
          placeId: `place_${vUser.id}`,
          placeName: vData.companyName,
          placeUrl: "https://maps.google.com",
          rating: 4.9,
          userRatingsTotal: 34,
          verified: true,
          verificationMethod: "oauth",
        },
      },
      tier: "standard" as const,
      documents: [],
      acceptedTerms: true,
      profileCompletion: 100,
      verified: true,
      reviewedAt: now,
      reviewedBy: "admin",
      notes: null,
    };

    if (vProfile) {
      vProfile = await vendorProfileRepo.update(vProfile.id, profilePayload);
    } else {
      vProfile = await vendorProfileRepo.create(profilePayload);
    }

    // Activer l'abonnement pour que filterActiveVendors() le retienne
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    await adminRepo.updateUserSubscription(`sub_${vUser.id}`, {
      userId: vUser.id,
      planId: "pro_yearly",
      status: "active",
      stripeCustomerId: `cus_${vUser.id}`,
      stripeSubscriptionId: `sub_stripe_${vUser.id}`,
      currentPeriodStart: now,
      currentPeriodEnd: oneYearLater,
      canceledAt: null,
      planInterval: "year",
      amount: 49000,
      currency: "eur",
    });

    createdVendors.push({ profile: vProfile, user: vUser });
  }
  console.log(`✅ ${createdVendors.length} prestataires enregistrés et activés.\n`);

  // 3. CRÉATION DES APPELS D'OFFRES ET PROPOSITIONS POUR LES TESTS
  console.log("📑 3. Création des appels d'offres de test pour Sophie & Thomas...");

  const chateauVendor = createdVendors.find((v) => v.profile.serviceCategory === "Château mariage");
  const traiteurVendor = createdVendors.find((v) => v.profile.serviceCategory === "Traiteur mariage");
  const foodTruckVendor = createdVendors.find((v) => v.profile.serviceCategory === "Food Truck");
  const photoVendor = createdVendors.find((v) => v.profile.serviceCategory === "Photo mariage");

  // Appel d'offres 1 : Château (CLÔTURÉ / VALIDÉ -> Permet de voir le badge Réservé)
  if (chateauVendor) {
    const existingTenders = await tenderRepo.listByProject(project.id);
    let tender1 = existingTenders.find((t) => t.category === "Château mariage" || t.category === "Lieu de réception");
    if (!tender1) {
      tender1 = await tenderRepo.create({
        projectId: project.id,
        category: "Château mariage",
        status: "closed",
        guestCount: 120,
        budgetRange: { min: 5000, max: 8000, currency: "EUR" },
        requirements: ["Parc pour cocktail en extérieur", "Hébergement sur place pour les mariés et témoins"],
        location: { city: "Chantilly", country: "France" },
        weddingDate: "2027-06-19",
        priority: "ambiance",
        style: "chic",
        customStyle: "Romantique et prestigieux",
        selectedProposalId: null,
      });

      const prop1 = await proposalRepo.create({
        tenderId: tender1.id,
        vendorId: chateauVendor.profile.id,
        projectId: project.id,
        status: "accepted",
        estimatedPrice: 6500,
        currency: "EUR",
        coverMessage: "Chers Sophie et Thomas, c'est avec un immense honneur que nous vous accueillons au Château de Montmirail pour célébrer votre union.",
        breakdown: [
          { label: "Privatisation exclusive du domaine et des salons", amount: 5000 },
          { label: "Mise à disposition de l'orangerie pour le dîner", amount: 1000 },
          { label: "Suite nuptiale pour la nuit de noces", amount: 500 },
        ],
      });

      await tenderRepo.update(tender1.id, { selectedProposalId: prop1.id });
      console.log("  -> Appel d'offres 'Château mariage' créé avec proposition VALIDÉE (Château de Montmirail)");
    }
  }

  // Appel d'offres 2 : Traiteur (EN COURS avec 2 propositions reçues pour tester la comparaison)
  if (traiteurVendor && foodTruckVendor) {
    const existingTenders = await tenderRepo.listByProject(project.id);
    let tender2 = existingTenders.find((t) => t.category === "Traiteur mariage");
    if (!tender2) {
      tender2 = await tenderRepo.create({
        projectId: project.id,
        category: "Traiteur mariage",
        status: "responded",
        guestCount: 120,
        budgetRange: { min: 9000, max: 15000, currency: "EUR" },
        requirements: ["Cocktail 8 pièces", "Entrée, plat chaud, dessert", "Options végétariennes requises"],
        location: { city: "Paris", country: "France" },
        weddingDate: "2027-06-19",
        priority: "qualite",
        style: "boheme",
        customStyle: "Gastronomie raffinée et conviviale",
        selectedProposalId: null,
      });

      await proposalRepo.create({
        tenderId: tender2.id,
        vendorId: traiteurVendor.profile.id,
        projectId: project.id,
        status: "submitted",
        estimatedPrice: 11400,
        currency: "EUR",
        coverMessage: "Bonjour Sophie & Thomas, nous vous proposons notre formule 'Prestige Bohème' incluant cocktail d'accueil, dîner servi à l'assiette et vin d'honneur.",
        breakdown: [
          { label: "Menu complet par convive (95€ x 120)", amount: 11400 },
        ],
      });

      await proposalRepo.create({
        tenderId: tender2.id,
        vendorId: foodTruckVendor.profile.id,
        projectId: project.id,
        status: "submitted",
        estimatedPrice: 5400,
        currency: "EUR",
        coverMessage: "Bonjour ! Nous pouvons assurer une formule brunch décontractée au camion le lendemain ou un cocktail déjeunatoire ultra convivial.",
        breakdown: [
          { label: "Formule Food Truck gourmet (45€ x 120)", amount: 5400 },
        ],
      });

      console.log("  -> Appel d'offres 'Traiteur mariage' créé avec 2 PROPOSITIONS EN ATTENTE");
    }
  }

  // 4. PRÉ-GÉNÉRATION DES MATCHES IA (POUR QUE LE COUPLE VOIE IMMÉDIATEMENT LES SUGGESTIONS AUTOMATIQUES)
  console.log("\n✨ 4. Génération des suggestions de matching IA pour le couple...");
  await matchRepo.deleteByProject(project.id);

  for (const item of createdVendors) {
    const score = Math.floor(86 + Math.random() * 12); // Scores entre 86% et 98%
    await matchRepo.create({
      projectId: project.id,
      vendorId: item.profile.id,
      category: item.profile.serviceCategory,
      score,
      status: "suggested",
      reasons: [
        "Localisation idéale en Île-de-France / région parisienne",
        "Tarifs parfaitement alignés avec votre budget de mariage",
        `Style ${item.profile.styles.join(" & ")} en adéquation avec votre univers`,
        "Excellentes notes et avis vérifiés sur des mariages récents",
      ],
      summary: `${item.profile.companyName} correspond remarquablement à votre projet pour vos ${project.guestCount} invités grâce à son expérience et son approche sur mesure.`,
      vendorPitch: "Nous serions ravis de contribuer à la réussite de votre beau jour !",
      criteriaScores: {
        budget: 95,
        location: 92,
        capacity: 94,
        style: 90,
      },
    });
  }
  console.log(`✅ ${createdVendors.length} suggestions de matching créées.`);

  console.log("\n=======================================================");
  console.log("🎉 SEEDING TERMINÉ AVEC SUCCÈS !");
  console.log("=======================================================");
  console.log("🔑 IDENTIFIANTS POUR TESTER LES WORKFLOWS :");
  console.log("-------------------------------------------------------");
  console.log("👰 COMPTE COUPLE :");
  console.log("  Email    : sophie.thomas@test.fr");
  console.log("  Mot de passe : Password123!");
  console.log("  Projet   : Mariage de Sophie & Thomas (120 invités, 35 000 €)");
  console.log("\n🏰 COMPTES PRESTATAIRES (Exemples représentatifs) :");
  console.log("  - Château       : contact@chateau-montmirail.fr  (Password123!)");
  console.log("  - Traiteur      : contact@atelier-gourmet.fr    (Password123!)");
  console.log("  - Photographe   : contact@lumieredamour-photo.fr (Password123!)");
  console.log("  - Vidéaste      : films@cinemaducoeur.fr        (Password123!)");
  console.log("  - DJ / Musique  : booking@soundandlight-mariage.fr (Password123!)");
  console.log("  - Robe mariée   : contact@maisonblanche-mariee.fr (Password123!)");
  console.log("  - Costumes      : surmesure@victor-tailleur.fr   (Password123!)");
  console.log("  - Wedding cake  : contact@sweetcouture-cakes.fr (Password123!)");
  console.log("  - Wedding Planner : contact@harmonie-etoiles.fr (Password123!)");
  console.log("  - Fleuriste     : contact@fleurs-sauvages.fr     (Password123!)");
  console.log("  - Voiture       : contact@prestige-vintagecar.fr (Password123!)");
  console.log("  - Food truck    : bonjour@letruckdesmaries.fr    (Password123!)");
  console.log("=======================================================\n");
}

seedRealTestData().catch((err) => {
  console.error("❌ Erreur pendant le seed :", err);
  process.exit(1);
});
