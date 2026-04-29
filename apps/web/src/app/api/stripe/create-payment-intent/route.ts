import { NextRequest, NextResponse } from "next/server";
import { getStripe, PREMIUM_PRICE_CENTS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, instructorId, amount, classId, sellerStripeAccountId } = body;

    if (!type || !instructorId) {
      return NextResponse.json(
        { error: "Missing required fields: type, instructorId" },
        { status: 400 },
      );
    }

    let paymentIntent;

    if (type === "subscription") {
      // Premium subscription payment
      paymentIntent = await getStripe().paymentIntents.create({
        amount: PREMIUM_PRICE_CENTS,
        currency: "usd",
        metadata: {
          type: "subscription",
          instructorId,
          tier: "premium",
        },
        automatic_payment_methods: { enabled: true },
      });
    } else if (type === "marketplace") {
      // Marketplace class/exercise purchase
      if (!amount || !classId) {
        return NextResponse.json(
          { error: "Missing required fields for marketplace: amount, classId" },
          { status: 400 },
        );
      }

      const amountCents = Math.round(amount * 100);
      const platformFeeCents = Math.round(amountCents * 0.02); // 2% platform fee

      const intentParams: Record<string, unknown> = {
        amount: amountCents,
        currency: "usd",
        metadata: {
          type: "marketplace",
          instructorId,
          classId,
        },
        automatic_payment_methods: { enabled: true },
      };

      // If seller has a Stripe Connect account, use destination charges
      if (sellerStripeAccountId) {
        intentParams.transfer_data = {
          destination: sellerStripeAccountId,
        };
        intentParams.application_fee_amount = platformFeeCents;
      }

      paymentIntent = await getStripe().paymentIntents.create(
        intentParams as Parameters<ReturnType<typeof getStripe>["paymentIntents"]["create"]>[0],
      );
    } else {
      return NextResponse.json(
        { error: "Invalid payment type. Must be 'subscription' or 'marketplace'" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("[Stripe] Create PaymentIntent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
