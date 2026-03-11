import { describe, it, expect, beforeEach } from "vitest";
import { useVerifyStore } from "./verify";

describe("verifyStore", () => {
  beforeEach(() => {
    useVerifyStore.getState().reset();
  });

  it("initializes with idle state", () => {
    const state = useVerifyStore.getState();
    expect(state.step).toBe("idle");
    expect(state.selectedProvider).toBeNull();
    expect(state.selectedProviderName).toBeNull();
    expect(state.proofData).toBeNull();
    expect(state.txHash).toBeNull();
    expect(state.tokenId).toBeNull();
    expect(state.errorMessage).toBeNull();
  });

  it("setStep changes step", () => {
    useVerifyStore.getState().setStep("connecting");
    expect(useVerifyStore.getState().step).toBe("connecting");
  });

  it("setProvider sets provider and advances to proving", () => {
    useVerifyStore.getState().setProvider("basi", "BASI Pilates");
    const state = useVerifyStore.getState();
    expect(state.selectedProvider).toBe("basi");
    expect(state.selectedProviderName).toBe("BASI Pilates");
    expect(state.step).toBe("proving");
  });

  it("setProofData sets data and advances to submitting", () => {
    useVerifyStore.getState().setProofData({ proof: "abc" });
    const state = useVerifyStore.getState();
    expect(state.proofData).toEqual({ proof: "abc" });
    expect(state.step).toBe("submitting");
  });

  it("setResult sets hash/token and advances to success", () => {
    useVerifyStore.getState().setResult("0xhash", "token-1");
    const state = useVerifyStore.getState();
    expect(state.txHash).toBe("0xhash");
    expect(state.tokenId).toBe("token-1");
    expect(state.step).toBe("success");
  });

  it("setError sets message and moves to error step", () => {
    useVerifyStore.getState().setError("Something failed");
    const state = useVerifyStore.getState();
    expect(state.errorMessage).toBe("Something failed");
    expect(state.step).toBe("error");
  });

  it("reset clears everything back to idle", () => {
    useVerifyStore.getState().setProvider("stott", "STOTT");
    useVerifyStore.getState().setProofData({ x: 1 });
    useVerifyStore.getState().setResult("hash", "token");
    useVerifyStore.getState().reset();
    const state = useVerifyStore.getState();
    expect(state.step).toBe("idle");
    expect(state.selectedProvider).toBeNull();
    expect(state.proofData).toBeNull();
    expect(state.txHash).toBeNull();
  });

  it("full verification flow", () => {
    const store = useVerifyStore.getState();
    store.setStep("connecting");
    expect(useVerifyStore.getState().step).toBe("connecting");

    store.setStep("choosing");
    expect(useVerifyStore.getState().step).toBe("choosing");

    useVerifyStore.getState().setProvider("basi", "BASI");
    expect(useVerifyStore.getState().step).toBe("proving");

    useVerifyStore.getState().setProofData({ proof: "data" });
    expect(useVerifyStore.getState().step).toBe("submitting");

    useVerifyStore.getState().setResult("0xabc", "badge-1");
    expect(useVerifyStore.getState().step).toBe("success");
  });
});
