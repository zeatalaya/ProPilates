import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildTreasuryGrant, getTreasuryConfig, buildSubscribeMsg } from "./treasury";
import { setContractConfig, getContractConfig } from "./config";

describe("treasury contract messages", () => {
  let originalConfig: ReturnType<typeof getContractConfig>;

  beforeEach(() => {
    originalConfig = { ...getContractConfig() };
    setContractConfig({
      treasuryContract: "xion1treasury",
      usdcDenom: "ibc/usdc",
    });
  });

  afterEach(() => {
    setContractConfig(originalConfig);
  });

  describe("buildTreasuryGrant", () => {
    it("builds grant message with correct grantee", () => {
      const msg = buildTreasuryGrant("xion1user");
      expect(msg.grant.grantee).toBe("xion1user");
      expect(msg.grant.authorization.type_url).toBe(
        "/cosmos.authz.v1beta1.GenericAuthorization"
      );
    });

    it("encodes authorization value as base64", () => {
      const msg = buildTreasuryGrant("xion1user");
      const decoded = JSON.parse(atob(msg.grant.authorization.value));
      expect(decoded.msg).toBe("/cosmwasm.wasm.v1.MsgExecuteContract");
    });
  });

  describe("getTreasuryConfig", () => {
    it("returns treasury address", () => {
      const config = getTreasuryConfig();
      expect(config.treasury).toBe("xion1treasury");
      expect(config.treasuryConfig.treasury_address).toBe("xion1treasury");
    });
  });

  describe("buildSubscribeMsg", () => {
    it("builds subscription for 1 month", () => {
      const msg = buildSubscribeMsg("xion1user", 1);
      expect(msg.contractAddress).toBe("xion1treasury");
      expect(msg.msg.subscribe.subscriber).toBe("xion1user");
      expect(msg.msg.subscribe.months).toBe(1);
      expect(msg.funds).toEqual([
        { denom: "ibc/usdc", amount: "4990000" },
      ]);
    });

    it("builds subscription for multiple months", () => {
      const msg = buildSubscribeMsg("xion1user", 3);
      expect(msg.msg.subscribe.months).toBe(3);
      expect(msg.funds[0].amount).toBe("14970000");
    });

    it("defaults to 1 month", () => {
      const msg = buildSubscribeMsg("xion1user");
      expect(msg.msg.subscribe.months).toBe(1);
      expect(msg.funds[0].amount).toBe("4990000");
    });
  });
});
