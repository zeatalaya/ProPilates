import { create } from "zustand";
import type { VerificationProvider } from "@/types";

export type VerifyStep =
  | "idle"
  | "connecting"
  | "choosing"
  | "proving"
  | "submitting"
  | "success"
  | "error";

interface VerifyState {
  step: VerifyStep;
  selectedProvider: VerificationProvider | null;
  selectedProviderName: string | null;
  proofData: Record<string, unknown> | null;
  txHash: string | null;
  tokenId: string | null;
  errorMessage: string | null;

  setStep: (step: VerifyStep) => void;
  setProvider: (id: VerificationProvider, name: string) => void;
  setProofData: (data: Record<string, unknown>) => void;
  setResult: (txHash: string, tokenId: string) => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useVerifyStore = create<VerifyState>((set) => ({
  step: "idle",
  selectedProvider: null,
  selectedProviderName: null,
  proofData: null,
  txHash: null,
  tokenId: null,
  errorMessage: null,

  setStep: (step) => set({ step }),
  setProvider: (id, name) =>
    set({ selectedProvider: id, selectedProviderName: name, step: "proving" }),
  setProofData: (proofData) => set({ proofData, step: "submitting" }),
  setResult: (txHash, tokenId) => set({ txHash, tokenId, step: "success" }),
  setError: (errorMessage) => set({ errorMessage, step: "error" }),
  reset: () =>
    set({
      step: "idle",
      selectedProvider: null,
      selectedProviderName: null,
      proofData: null,
      txHash: null,
      tokenId: null,
      errorMessage: null,
    }),
}));
