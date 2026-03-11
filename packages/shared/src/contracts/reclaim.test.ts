import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildSubmitProofMsg,
  buildQueryVerification,
  buildQueryAllVerifications,
} from "./reclaim";
import { setContractConfig, getContractConfig } from "./config";

describe("reclaim contract messages", () => {
  let originalConfig: ReturnType<typeof getContractConfig>;

  beforeEach(() => {
    originalConfig = { ...getContractConfig() };
    setContractConfig({ reclaimContract: "xion1reclaim" });
  });

  afterEach(() => {
    setContractConfig(originalConfig);
  });

  describe("buildSubmitProofMsg", () => {
    it("builds verify proof message", () => {
      const proofData = {
        claimInfo: {
          provider: "basi",
          parameters: '{"certId":"123"}',
          context: "certification",
        },
        signedClaim: {
          claim: {
            identifier: "id-1",
            owner: "xion1user",
            timestampS: 1700000000,
            epoch: 1,
          },
          signatures: ["sig1", "sig2"],
        },
      };
      const msg = buildSubmitProofMsg("xion1user", "basi", proofData);
      expect(msg.contractAddress).toBe("xion1reclaim");
      expect(msg.msg.verify_proof.instructor).toBe("xion1user");
      expect(msg.msg.verify_proof.provider).toBe("basi");
      expect(msg.msg.verify_proof.claim_info).toEqual(proofData.claimInfo);
      expect(msg.msg.verify_proof.signed_claim).toEqual(proofData.signedClaim);
    });
  });

  describe("buildQueryVerification", () => {
    it("builds single verification query", () => {
      const msg = buildQueryVerification("xion1user", "basi");
      expect(msg).toEqual({
        get_verification: { instructor: "xion1user", provider: "basi" },
      });
    });
  });

  describe("buildQueryAllVerifications", () => {
    it("builds all verifications query", () => {
      const msg = buildQueryAllVerifications("xion1user");
      expect(msg).toEqual({
        get_all_verifications: { instructor: "xion1user" },
      });
    });
  });
});
