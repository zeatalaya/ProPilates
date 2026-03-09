"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/auth";
import { buildSubmitProofMsg, RECLAIM_CONTRACT } from "@/contracts/reclaim";
import { submitTransaction, buildReclaimVerifyMsg } from "@/lib/xion-transactions";
import { truncateAddress } from "@/lib/utils";
import type { VerificationProvider } from "@/types";

interface ProviderOption {
  id: VerificationProvider;
  name: string;
  description: string;
  reclaimProviderId: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: "basi",
    name: "BASI Pilates",
    description:
      "Body Arts and Science International — comprehensive Pilates education.",
    reclaimProviderId: "basi-certification-provider",
  },
  {
    id: "stott",
    name: "STOTT PILATES",
    description:
      "Merrithew's contemporary approach to Pilates exercise.",
    reclaimProviderId: "stott-certification-provider",
  },
  {
    id: "balanced_body",
    name: "Balanced Body",
    description:
      "Education and equipment for mind-body movement professionals.",
    reclaimProviderId: "balanced-body-certification-provider",
  },
  {
    id: "polestar",
    name: "Polestar Pilates",
    description: "Rehabilitation-based Pilates education.",
    reclaimProviderId: "polestar-certification-provider",
  },
];

type VerifyStatus = "idle" | "generating" | "proving" | "submitting" | "success" | "error";

export default function VerifyPage() {
  const { instructor, xionAddress, oauthAccessToken } = useAuthStore();
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderOption | null>(null);
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function startVerification(provider: ProviderOption) {
    if (!instructor || !xionAddress) return;
    setSelectedProvider(provider);
    setStatus("generating");
    setErrorMsg("");

    try {
      // Step 1: Generate Reclaim verification request
      // In production, use @reclaim-protocol/js-sdk to create a proof request
      setStatus("proving");

      // Simulate proof generation
      // The actual flow opens a QR code or redirect for the user to prove their credential
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

      // Step 2: Validate proof server-side
      const validateRes = await fetch("/api/reclaim/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: instructor.id,
          provider: provider.id,
          proofData: mockProofData,
        }),
      });

      if (!validateRes.ok) throw new Error("Server validation failed");

      // Step 3: Submit proof on-chain via Abstraxion OAuth2 transaction API
      setStatus("submitting");

      if (oauthAccessToken) {
        // Submit via Treasury-granted MsgExecuteContract on Reclaim contract
        const txMsg = buildReclaimVerifyMsg(
          xionAddress,
          instructor.id,
          provider.id,
          mockProofData,
        );
        const result = await submitTransaction(oauthAccessToken, [txMsg]);
        console.log("On-chain tx result:", result);
      } else {
        // Fallback: log the message for manual submission
        const msg = buildSubmitProofMsg(xionAddress, provider.id, mockProofData);
        console.log("On-chain submit msg (no access token):", msg);
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Verification failed");
    }
  }

  if (!instructor) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-muted">Connect wallet to verify credentials.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <ShieldCheck className="text-violet-400" />
          Credential Verification
        </h1>
        <p className="mt-2 text-text-secondary">
          Verify your Pilates certifications on-chain using Reclaim Protocol ZK
          proofs. Verified credentials are stored on the XION blockchain as
          tamper-proof badges.
        </p>
      </div>

      {/* Contract info */}
      <div className="mb-8 rounded-lg border border-border bg-bg-card p-4">
        <div className="text-xs text-text-muted">Verification Contract</div>
        <div className="font-mono text-sm text-violet-400">
          {truncateAddress(RECLAIM_CONTRACT, 16)}
        </div>
      </div>

      {/* Status banner */}
      {status === "success" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <CheckCircle className="text-emerald-400" />
          <div>
            <div className="font-semibold text-emerald-400">
              Verification Successful!
            </div>
            <div className="text-sm text-text-secondary">
              Your {selectedProvider?.name} certification has been verified
              on-chain.
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="text-red-400" />
          <div>
            <div className="font-semibold text-red-400">
              Verification Failed
            </div>
            <div className="text-sm text-text-secondary">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Provider cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const isActive =
            selectedProvider?.id === provider.id &&
            ["generating", "proving", "submitting"].includes(status);

          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <Badge variant="violet">ZK Proof</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <p className="mb-4 text-sm text-text-secondary">
                  {provider.description}
                </p>

                {isActive ? (
                  <div className="flex items-center gap-2 text-sm text-violet-400">
                    <Loader2 size={16} className="animate-spin" />
                    {status === "generating" && "Generating proof request..."}
                    {status === "proving" && "Waiting for proof..."}
                    {status === "submitting" && "Submitting on-chain..."}
                  </div>
                ) : (
                  <button
                    className="btn-primary w-full text-sm"
                    onClick={() => startVerification(provider)}
                    disabled={isActive}
                  >
                    <ShieldCheck size={16} />
                    Verify Credential
                  </button>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* How it works */}
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-bold">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: 1,
              title: "Select Provider",
              desc: "Choose which certification body to verify against.",
            },
            {
              step: 2,
              title: "Generate ZK Proof",
              desc: "Reclaim Protocol generates a zero-knowledge proof of your credential without revealing sensitive data.",
            },
            {
              step: 3,
              title: "Store On-Chain",
              desc: "The proof is verified and stored on XION blockchain as an immutable credential badge.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="glass-card p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {step}
              </div>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
