import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    })
  : null;

export function getStripe(): Stripe {
  if (!stripe) throw new Error("Stripe non configuré. Ajoute STRIPE_SECRET_KEY.");
  return stripe;
}

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}
