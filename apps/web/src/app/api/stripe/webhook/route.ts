import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { type, instructorId, classId } = paymentIntent.metadata;

        if (type === "subscription") {
          // Activate premium subscription
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

          await supabase.from("subscriptions").insert({
            instructor_id: instructorId,
            tier: "premium",
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            status: "active",
            payment_method: "stripe",
            amount_usdc: paymentIntent.amount / 100,
            tx_hash: paymentIntent.id,
          });

          await supabase
            .from("instructors")
            .update({ tier: "premium" })
            .eq("id", instructorId);

          console.log(`[Stripe Webhook] Premium activated for instructor ${instructorId}`);
        } else if (type === "marketplace" && classId) {
          console.log(`[Stripe Webhook] Marketplace purchase confirmed: class ${classId}`);
          // portfolio_access is created by the iOS app after payment confirmation
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.error(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);
        break;
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
