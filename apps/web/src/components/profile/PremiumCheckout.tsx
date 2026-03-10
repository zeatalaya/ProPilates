"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  CrossmintEmbeddedCheckout,
  CrossmintCheckoutProvider,
  useCrossmintCheckout,
} from "@crossmint/client-sdk-react-ui";
import { useAuthStore } from "@/stores/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const CROSSMINT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_CROSSMINT_COLLECTION_ID ?? "";

interface Props {
  instructorId: string;
  xionAddress?: string | null;
}

function CheckoutInner({ instructorId, xionAddress }: Props) {
  const { setTier } = useAuthStore();
  const { order } = useCrossmintCheckout();
  const [activated, setActivated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (order?.phase === "completed" && !activated) {
      activatePremium();
    }
  }, [order?.phase, activated]);

  async function activatePremium() {
    try {
      if (isSupabaseConfigured) {
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

        const { error: updateError } = await supabase
          .from("instructors")
          .update({ tier: "premium" })
          .eq("id", instructorId);

        if (updateError) throw updateError;
      }

      setTier("premium");
      setActivated(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to activate premium.");
    }
  }

  if (activated) {
    return (
      <div className="text-center">
        <img src="/icon-70.svg" alt="" className="w-12 h-12 rounded-lg mx-auto mb-2" />
        <p className="font-semibold" style={{ color: "#f0d898" }}>Premium Activated!</p>
        <p className="text-sm text-text-secondary">
          You now have access to all premium features.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-text-secondary">
        Upgrade to save classes, list on marketplace, Spotify integration, and verification badges.
      </p>

      <div className="mb-3 rounded-lg p-3" style={{ border: "1px solid rgba(184, 137, 42, 0.3)", background: "rgba(184, 137, 42, 0.05)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon-70.svg" alt="" className="w-9 h-9 rounded-lg" />
            <div>
              <div className="font-semibold text-text-primary">Premium Plan</div>
              <div className="text-xs text-text-secondary">
                All features included
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: "#f0d898" }}>$4.99</div>
            <div className="text-xs text-text-muted">USDC/month</div>
          </div>
        </div>
      </div>

      {errorMsg && <p className="mb-2 text-sm text-red-400">{errorMsg}</p>}

      <CrossmintEmbeddedCheckout
        lineItems={{
          collectionLocator: `crossmint:${CROSSMINT_COLLECTION_ID}`,
          callData: {
            totalPrice: "4.99",
            quantity: 1,
          },
        }}
        payment={{
          crypto: { enabled: true },
          fiat: { enabled: true },
          defaultMethod: "fiat",
        }}
        {...(xionAddress && !xionAddress.includes("demo")
          ? {
              recipient: { walletAddress: xionAddress },
            }
          : {})}
        appearance={{
          variables: {
            colors: {
              backgroundPrimary: "#1a1a2e",
              textPrimary: "#e2e8f0",
              textSecondary: "#94a3b8",
              borderPrimary: "#334155",
              accent: "#c9a96e",
            },
            borderRadius: "8px",
          },
          rules: {
            ...(xionAddress && !xionAddress.includes("demo")
              ? { DestinationInput: { display: "hidden" } }
              : {}),
          },
        }}
      />
    </div>
  );
}

export function PremiumCheckout({ instructorId, xionAddress }: Props) {
  if (!CROSSMINT_COLLECTION_ID) {
    return (
      <p className="text-sm text-text-muted">
        Payment not configured. Contact support.
      </p>
    );
  }

  return (
    <CrossmintCheckoutProvider>
      <CheckoutInner instructorId={instructorId} xionAddress={xionAddress} />
    </CrossmintCheckoutProvider>
  );
}
