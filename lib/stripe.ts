import Stripe from "stripe";
import { env } from "@/lib/env";

const secretKey = env.STRIPE_SECRET_KEY;

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    })
  : null;

export function getStripe(): Stripe {
  if (!stripe) throw new Error("Stripe non configuré. Ajoute STRIPE_SECRET_KEY.");
  return stripe;
}

export const STRIPE_PRICE_ID = env.STRIPE_PRICE_ID || "";
export const STRIPE_PRICE_ESSENTIAL_ID = env.STRIPE_PRICE_ESSENTIAL_ID || env.STRIPE_PRICE_ID || "";
export const STRIPE_PRICE_PREMIUM_ID = env.STRIPE_PRICE_PREMIUM_ID || "";
export const STRIPE_PRICE_ELITE_ID = env.STRIPE_PRICE_ELITE_ID || "";

export const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  essential: STRIPE_PRICE_ESSENTIAL_ID || undefined,
  premium: STRIPE_PRICE_PREMIUM_ID || undefined,
  elite: STRIPE_PRICE_ELITE_ID || undefined,
};

export function getPlanPriceId(planId: string): string | undefined {
  return PLAN_PRICE_IDS[planId.toLowerCase()];
}

export function getStripePublishableKey() {
  return env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}
