"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useVerifyStore } from "@/stores/verify";
import { useAuthStore } from "@/stores/auth";
import { PROVIDERS } from "./StepChooseProvider";

export function StepProve() {
  const { selectedProvider, selectedProviderName, setProofData, setStep, setError } =
    useVerifyStore();
  const { instructor, xionAddress } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(true);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);

  const generateProof = useCallback(async () => {
    if (!provider || !instructor || !xionAddress) return;

    setIsGenerating(true);
    try {
      // In production, use @reclaimprotocol/js-sdk:
      //   const proofRequest = await ReclaimProofRequest.init(appId, appSecret, providerId);
      //   proofRequest.setParams({ certification: provider.id });
      //   const url = await proofRequest.getRequestUrl();
      //   proofRequest.startSession({ onSuccess, onFailure });
      //
      // For now, simulate the proof generation flow
      await new Promise((r) => setTimeout(r, 1500));

      const mockProofUrl = `https://share.reclaimprotocol.org/verify?provider=${provider.reclaimProviderId}`;
      setProofUrl(mockProofUrl);
      setIsGenerating(false);

      // Simulate proof completion after a delay (in production, this comes from SDK callback)
      setTimeout(async () => {
        const mockProofData = {
          claimInfo: {
            provider: provider.reclaimProviderId,
            parameters: JSON.stringify({ certification: provider.id }),
            context: JSON.stringify({
              instructor: instructor.id,
              address: xionAddress,
            }),
          },
          signedClaim: {
            claim: {
              identifier: `${provider.id}-${instructor.id}-${Date.now()}`,
              owner: xionAddress,
              timestampS: Math.floor(Date.now() / 1000),
              epoch: 1,
            },
            signatures: ["mock-signature-placeholder"],
          },
        };

        // Validate server-side
        const validateRes = await fetch("/api/reclaim/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructorId: instructor.id,
            provider: provider.id,
            proofData: mockProofData,
          }),
        });

        if (!validateRes.ok) {
          setError("Server validation failed");
          return;
        }

        setProofData(mockProofData);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to generate proof request");
    }
  }, [provider, instructor, xionAddress, setProofData, setError]);

  useEffect(() => {
    generateProof();
  }, [generateProof]);

  return (
    <div className="flex justify-center py-6">
      <Card className="w-full max-w-lg">
        <CardBody className="flex flex-col items-center gap-6 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15">
            <ShieldCheck size={32} className="text-violet-400" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold">
              Verify {selectedProviderName}
            </h3>
            <Badge variant="violet" className="mt-2">
              Truth Engine
            </Badge>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-violet-400" />
              <p className="text-sm text-text-secondary">
                Generating proof request...
              </p>
            </div>
          ) : proofUrl ? (
            <div className="flex w-full flex-col items-center gap-4">
              {/* Three-dot progress indicator */}
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400 [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400 [animation-delay:0.4s]" />
              </div>

              <p className="text-sm text-text-secondary">
                Complete the verification in the Truth Engine portal, then return
                here.
              </p>

              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                <ExternalLink size={16} />
                Open Verification Portal
              </a>

              <p className="text-xs text-text-muted">
                Waiting for proof completion...
              </p>
            </div>
          ) : null}

          <button
            onClick={() => setStep("choosing")}
            className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            Choose a different provider
          </button>
        </CardBody>
      </Card>
    </div>
  );
}
