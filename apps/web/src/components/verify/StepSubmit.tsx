"use client";

import { useEffect, useRef } from "react";
import { Loader2, Shield } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { useVerifyStore } from "@/stores/verify";
import { useAuthStore } from "@/stores/auth";
import {
  submitTransaction,
  buildClearanceMintMsg,
  CONTRACTS,
} from "@/lib/xion-transactions";

export function StepSubmit() {
  const { selectedProvider, proofData, setResult, setError } = useVerifyStore();
  const { oauthAccessToken, xionAddress } = useAuthStore();
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    async function submit() {
      if (!xionAddress || !selectedProvider || !proofData) {
        setError("Missing required data for submission");
        return;
      }

      try {
        if (oauthAccessToken && CONTRACTS.clearance) {
          const txMsg = buildClearanceMintMsg(
            xionAddress,
            selectedProvider,
            proofData as {
              claimInfo: Record<string, unknown>;
              signedClaim: Record<string, unknown>;
            },
          );
          const result = await submitTransaction(oauthAccessToken, [txMsg]);
          const tokenId = `badge-${Date.now()}`; // In production, parse from tx events
          setResult(result.transactionHash, tokenId);
        } else {
          // Demo mode: simulate successful mint
          console.log("Demo mode - would submit clearance proof:", {
            sender: xionAddress,
            provider: selectedProvider,
            proofData,
          });
          await new Promise((r) => setTimeout(r, 2000));
          setResult(`demo-tx-${Date.now()}`, `badge-${Date.now()}`);
        }
      } catch (err: any) {
        setError(err.message || "Transaction failed");
      }
    }

    submit();
  }, [xionAddress, selectedProvider, proofData, oauthAccessToken, setResult, setError]);

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardBody className="flex flex-col items-center gap-6 py-10">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/15">
              <Shield size={36} className="text-violet-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-bg-card">
              <Loader2 size={18} className="animate-spin text-violet-400" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Minting Your Badge</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Submitting your certification proof to the XION blockchain.
              This may take a moment...
            </p>
          </div>

          {/* Progress indicator */}
          <div className="h-1 w-48 overflow-hidden rounded-full bg-bg-elevated">
            <div className="h-full w-full animate-[load-slide_1.5s_ease-in-out_infinite] rounded-full bg-violet-500" />
          </div>

          <p className="text-xs text-text-muted">
            Your badge will be permanently stored on-chain as a CW721 NFT.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
