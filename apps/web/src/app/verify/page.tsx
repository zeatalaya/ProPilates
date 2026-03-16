"use client";

import { useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  ListChecks,
  Fingerprint,
  Coins,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useVerifyStore } from "@/stores/verify";
import { truncateAddress } from "@/lib/utils";
import { CLEARANCE_CONTRACT } from "@/contracts/clearance";
import { CONTRACTS } from "@/lib/xion-transactions";
import { VerifyStepper } from "@/components/verify/VerifyStepper";
import { StepConnect } from "@/components/verify/StepConnect";
import { StepChooseProvider } from "@/components/verify/StepChooseProvider";
import { StepProve } from "@/components/verify/StepProve";
import { StepSubmit } from "@/components/verify/StepSubmit";
import { StepSuccess } from "@/components/verify/StepSuccess";

const STEPS = [
  { key: "connecting" as const, label: "Connect", icon: UserCheck },
  { key: "choosing" as const, label: "Choose", icon: ListChecks },
  { key: "proving" as const, label: "Prove", icon: Fingerprint },
  { key: "submitting" as const, label: "Submit", icon: Coins },
  { key: "success" as const, label: "Done", icon: CheckCircle },
];

export default function VerifyPage() {
  const { isConnected } = useAuthStore();
  const { step, errorMessage, setStep, reset } = useVerifyStore();

  // Set initial step based on auth state
  useEffect(() => {
    if (step === "idle") {
      setStep(isConnected ? "choosing" : "connecting");
    }
  }, [step, isConnected, setStep]);

  // Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const contractAddr = CLEARANCE_CONTRACT || CONTRACTS.reclaim;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <ShieldCheck className="text-violet-400" />
          Credential Verification
        </h1>
        <p className="mt-2 text-text-secondary">
          Verify your Pilates certifications using Truth Engine secure
          verification. Verified credentials are issued as tamper-proof digital
          badges.
        </p>
      </div>

      {/* Contract info */}
      {contractAddr && (
        <div className="mb-8 rounded-lg border border-border bg-bg-card p-4">
          <div className="text-xs text-text-muted">Verification Contract</div>
          <div className="font-mono text-sm text-violet-400">
            {truncateAddress(contractAddr, 16)}
          </div>
        </div>
      )}

      {/* Stepper */}
      <VerifyStepper currentStep={step} steps={STEPS} />

      {/* Error banner */}
      {step === "error" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <AlertCircle className="shrink-0 text-red-400" />
          <div className="flex-1">
            <div className="font-semibold text-red-400">
              Verification Failed
            </div>
            <div className="text-sm text-text-secondary">{errorMessage}</div>
          </div>
          <button
            onClick={() => setStep("choosing")}
            className="text-sm text-red-400 underline hover:text-red-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Step content */}
      {step === "connecting" && <StepConnect />}
      {step === "choosing" && <StepChooseProvider />}
      {step === "proving" && <StepProve />}
      {step === "submitting" && <StepSubmit />}
      {step === "success" && <StepSuccess />}

      {/* How it works */}
      <div className="mt-16">
        <h2 className="mb-6 text-xl font-bold">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            {
              step: 1,
              title: "Connect",
              desc: "Sign in to your account to get started.",
            },
            {
              step: 2,
              title: "Choose",
              desc: "Select which certification body to verify against.",
            },
            {
              step: 3,
              title: "Prove",
              desc: "Truth Engine securely verifies your credential without exposing sensitive data.",
            },
            {
              step: 4,
              title: "Submit",
              desc: "Your verification is submitted and your credential badge is issued.",
            },
            {
              step: 5,
              title: "Share",
              desc: "Your certification badge is permanently stored and shareable with anyone.",
            },
          ].map(({ step: s, title, desc }) => (
            <div key={s} className="glass-card p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {s}
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
