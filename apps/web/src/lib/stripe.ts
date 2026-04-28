import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

// Prices
export const PREMIUM_PRICE_CENTS = 499; // $4.99
export const PREMIUM_PRICE_DESCRIPTION = "ProPilates Premium - Monthly";

// Apple Pay merchant ID
export const APPLE_MERCHANT_ID = process.env.APPLE_MERCHANT_ID || "merchant.com.propilates.ios";
