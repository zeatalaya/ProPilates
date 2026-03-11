import { describe, it, expect } from "vitest";
import {
  MOBILE_METHODS,
  ALL_METHODS,
  CATEGORIES,
  DIFFICULTIES,
  XION_TESTNET,
  DURATION_PRESETS,
} from "./index";

describe("constants", () => {
  it("MOBILE_METHODS has mat, reformer, x-reformer", () => {
    const values = MOBILE_METHODS.map((m) => m.value);
    expect(values).toContain("mat");
    expect(values).toContain("reformer");
    expect(values).toContain("x-reformer");
    expect(MOBILE_METHODS.length).toBe(3);
  });

  it("ALL_METHODS matches MOBILE_METHODS", () => {
    expect(ALL_METHODS.length).toBe(MOBILE_METHODS.length);
  });

  it("CATEGORIES has expected exercise categories", () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(values).toContain("warmup");
    expect(values).toContain("strength");
    expect(values).toContain("cooldown");
    expect(values).toContain("flow");
    expect(CATEGORIES.length).toBe(7);
  });

  it("DIFFICULTIES has beginner, intermediate, advanced", () => {
    const values = DIFFICULTIES.map((d) => d.value);
    expect(values).toEqual(["beginner", "intermediate", "advanced"]);
  });

  it("XION_TESTNET has correct chain config", () => {
    expect(XION_TESTNET.chainId).toBe("xion-testnet-2");
    expect(XION_TESTNET.rpc).toContain("rpc.xion-testnet-2");
    expect(XION_TESTNET.rest).toContain("api.xion-testnet-2");
  });

  it("DURATION_PRESETS are sorted ascending", () => {
    for (let i = 1; i < DURATION_PRESETS.length; i++) {
      expect(DURATION_PRESETS[i]).toBeGreaterThan(DURATION_PRESETS[i - 1]);
    }
  });
});
