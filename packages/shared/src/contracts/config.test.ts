import { describe, it, expect, beforeEach } from "vitest";
import { setContractConfig, getContractConfig } from "./config";

describe("contractConfig", () => {
  // Save original and restore after each test
  let originalConfig: ReturnType<typeof getContractConfig>;

  beforeEach(() => {
    originalConfig = { ...getContractConfig() };
  });

  // Restore after each test to avoid test pollution
  afterEach(() => {
    setContractConfig(originalConfig);
  });

  it("returns default config", () => {
    const config = getContractConfig();
    expect(config.xionRpc).toBe("https://rpc.xion-testnet-2.burnt.com:443");
    expect(config.xionRest).toBe("https://api.xion-testnet-2.burnt.com");
    expect(config.usdcDenom).toBe("ibc/usdc");
    expect(config.treasuryContract).toBeTruthy();
    expect(config.reclaimContract).toBeTruthy();
  });

  it("setContractConfig merges partial config", () => {
    setContractConfig({ marketplaceContract: "xion1market" });
    expect(getContractConfig().marketplaceContract).toBe("xion1market");
    // Other values unchanged
    expect(getContractConfig().usdcDenom).toBe("ibc/usdc");
  });

  it("overwrites specific fields", () => {
    setContractConfig({ usdcDenom: "ibc/test" });
    expect(getContractConfig().usdcDenom).toBe("ibc/test");
  });
});
