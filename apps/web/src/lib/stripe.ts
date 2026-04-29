import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = undefined as unknown as Stripe;

// Prices
export const PREMIUM_PRICE_CENTS = 499; // $4.99
export const PREMIUM_PRICE_DESCRIPTION = "ProPilates Premium - Monthly";

// Apple Pay merchant ID
export const APPLE_MERCHANT_ID = process.env.APPLE_MERCHANT_ID || "merchant.com.propilates.ios";
