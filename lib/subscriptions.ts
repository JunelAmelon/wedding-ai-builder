import { env } from "@/lib/env";
import type { SubscriptionPlan } from "@/types/admin";

export const VENDOR_PLANS: SubscriptionPlan[] = [
  {
    id: "essential",
    name: "Essentiel",
    price: 4900,
    currency: "eur",
    interval: "month",
    commitmentMonths: 0,
    stripePriceId: env.STRIPE_PRICE_ESSENTIAL_ID || env.STRIPE_PRICE_ID || null,
    isActive: true,
    features: [
      "Matching intelligent",
      "Visibilité de base",
      "Badge vérifié",
      "Multi-annuaires",
      "1 vidéo tous les 3 mois",
    ],
  },
  {
    id: "premium",
    name: "Premium Business",
    price: 6900,
    currency: "eur",
    interval: "month",
    commitmentMonths: 0,
    stripePriceId: env.STRIPE_PRICE_PREMIUM_ID || null,
    isActive: true,
    features: [
      "Positionnement haut de gamme",
      "Multi-annuaires premium",
      "Vidéo mensuelle",
      "CM dédié",
      "Tunnels de vente",
    ],
  },
  {
    id: "elite",
    name: "Elite Performance",
    price: 14900,
    currency: "eur",
    interval: "month",
    commitmentMonths: 0,
    stripePriceId: env.STRIPE_PRICE_ELITE_ID || null,
    isActive: true,
    features: [
      "Priorité IA maximale",
      "Profil Star",
      "SEO + article blog",
      "Campagnes Google / Meta Ads",
      "Vidéo mensuelle + format ads",
      "CM dédié",
    ],
  },
];

export function getVendorPlanById(id: string): SubscriptionPlan | undefined {
  return VENDOR_PLANS.find((p) => p.id === id.toLowerCase());
}

export function getVendorPlanByStripePriceId(priceId: string): SubscriptionPlan | undefined {
  return VENDOR_PLANS.find((p) => p.stripePriceId === priceId);
}
