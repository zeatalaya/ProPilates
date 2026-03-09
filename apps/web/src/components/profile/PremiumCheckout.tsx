"use client";

import { useState } from "react";
import { Crown, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Props {
  instructorId: string;
}

const CROSSMINT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_CROSSMINT_COLLECTION_ID ?? "";
const CROSSMINT_PROJECT_ID =
  process.env.NEXT_PUBLIC_CROSSMINT_PROJECT_ID ?? "";
const CROSSMINT_ENVIRONMENT =
  (process.env.NEXT_PUBLIC_CROSSMINT_ENVIRONMENT as "staging" | "production") ??
  "staging";

export function PremiumCheckout({ instructorId }: Props) {
  const { setTier } = useAuthStore();
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleUpgrade() {
    setStatus("processing");
    setErrorMsg("");

    try {
      if (CROSSMINT_COLLECTION_ID && CROSSMINT_PROJECT_ID) {
        // Use Crossmint hosted checkout for credit card payment
        // Opens a new window to Crossmint's checkout page
        const checkoutUrl = new URL(
          `https://www.crossmint.com/checkout/mint`,
        );
        checkoutUrl.searchParams.set("projectId", CROSSMINT_PROJECT_ID);
        checkoutUrl.searchParams.set("collectionId", CROSSMINT_COLLECTION_ID);
        checkoutUrl.searchParams.set("environment", CROSSMINT_ENVIRONMENT);
        checkoutUrl.searchParams.set(
          "mintConfig",
          JSON.stringify({
            type: "managed",
            totalPrice: "4.99",
            currency: "usd",
          }),
        );

        // Open Crossmint checkout in a new window
        const checkoutWindow = window.open(
          checkoutUrl.toString(),
          "crossmint-checkout",
          "width=500,height=700",
        );

        // Poll for completion or listen for window close
        const pollInterval = setInterval(() => {
          if (checkoutWindow?.closed) {
            clearInterval(pollInterval);
            // After checkout window closes, assume success and update status
            // In production, use webhooks to confirm payment
            activatePremium();
          }
        }, 1000);

        return; // Don't set status yet, wait for window close
      }

      // Demo mode: simulate successful purchase
      await new Promise((r) => setTimeout(r, 1500));
      await activatePremium();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Purchase failed. Please try again.");
    }
  }

  async function activatePremium() {
    try {
      if (isSupabaseConfigured) {
        // Create subscription record
        const { error: subError } = await supabase
          .from("subscriptions")
          .insert({
            instructor_id: instructorId,
            tier: "premium",
            started_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            payment_method: "crossmint",
            amount_usdc: 4.99,
          });

        if (subError) throw subError;

        // Update instructor tier
        const { error: updateError } = await supabase
          .from("instructors")
          .update({ tier: "premium" })
          .eq("id", instructorId);

        if (updateError) throw updateError;
      }

      setTier("premium");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to activate premium.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
        <p className="font-semibold text-emerald-400">
          Premium Activated!
        </p>
        <p className="text-sm text-text-secondary">
          You now have access to all premium features.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-text-secondary">
        Free tier — upgrade to save classes, list on marketplace, and access
        Spotify integration.
      </p>

      <div className="mb-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-text-primary">
              Premium Plan
            </div>
            <div className="text-sm text-text-secondary">
              All features included
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-violet-400">$4.99</div>
            <div className="text-xs text-text-muted">USDC/month</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="mb-2 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        className="btn-primary w-full text-sm"
        onClick={handleUpgrade}
        disabled={status === "processing"}
      >
        {status === "processing" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Upgrade to Premium
          </>
        )}
      </button>

      <p className="mt-2 text-center text-xs text-text-muted">
        Secure payment via Crossmint. Pay with credit card.
      </p>
    </div>
  );
}
