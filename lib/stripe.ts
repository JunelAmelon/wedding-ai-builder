import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: undefined,
} as Stripe.StripeConfig);

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
}
