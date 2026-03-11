import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildMsgSend,
  buildMsgExecuteContract,
  buildReclaimVerifyMsg,
  buildClearanceMintMsg,
  buildMarketplaceListMessages,
  buildMarketplacePurchaseMsg,
  buildMarketplaceCancelMsg,
  submitTransaction,
  CONTRACTS,
} from "./xion-transactions";

// Mock btoa for Node
if (typeof globalThis.btoa === "undefined") {
  globalThis.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}

describe("xion-transactions", () => {
  describe("buildMsgSend", () => {
    it("builds a bank MsgSend message", () => {
      const msg = buildMsgSend("xion1from", "xion1to", "1000000");
      expect(msg.typeUrl).toBe("/cosmos.bank.v1beta1.MsgSend");
      expect(msg.value.fromAddress).toBe("xion1from");
      expect(msg.value.toAddress).toBe("xion1to");
      expect(msg.value.amount).toEqual([{ denom: "ibc/usdc", amount: "1000000" }]);
    });

    it("accepts custom denom", () => {
      const msg = buildMsgSend("xion1from", "xion1to", "500", "uxion");
      expect((msg.value.amount as Array<{ denom: string }>)[0].denom).toBe("uxion");
    });
  });

  describe("buildMsgExecuteContract", () => {
    it("builds a MsgExecuteContract with encoded msg", () => {
      const msg = buildMsgExecuteContract(
        "xion1sender",
        "xion1contract",
        { do_something: { arg: 1 } },
      );
      expect(msg.typeUrl).toBe("/cosmwasm.wasm.v1.MsgExecuteContract");
      expect(msg.value.sender).toBe("xion1sender");
      expect(msg.value.contract).toBe("xion1contract");
      // msg should be base64 encoded
      const decoded = JSON.parse(atob(msg.value.msg as string));
      expect(decoded).toEqual({ do_something: { arg: 1 } });
      expect(msg.value.funds).toEqual([]);
    });

    it("includes funds when provided", () => {
      const msg = buildMsgExecuteContract(
        "xion1sender",
        "xion1contract",
        { buy: {} },
        [{ denom: "ibc/usdc", amount: "5000000" }],
      );
      expect(msg.value.funds).toEqual([{ denom: "ibc/usdc", amount: "5000000" }]);
    });
  });

  describe("buildReclaimVerifyMsg", () => {
    it("builds reclaim verify message targeting reclaim contract", () => {
      const proof = {
        claimInfo: { provider: "basi", parameters: "{}", context: "cert" },
        signedClaim: { claim: { id: "1" }, signatures: ["sig1"] },
      };
      const msg = buildReclaimVerifyMsg("xion1sender", "xion1instr", "basi", proof);
      expect(msg.typeUrl).toBe("/cosmwasm.wasm.v1.MsgExecuteContract");
      expect(msg.value.contract).toBe(CONTRACTS.reclaim);
      const decoded = JSON.parse(atob(msg.value.msg as string));
      expect(decoded.verify_proof.instructor).toBe("xion1instr");
      expect(decoded.verify_proof.provider).toBe("basi");
    });
  });

  describe("buildClearanceMintMsg", () => {
    it("builds clearance mint message", () => {
      const proof = {
        claimInfo: { provider: "stott" },
        signedClaim: { signatures: ["sig"] },
      };
      const msg = buildClearanceMintMsg("xion1sender", "stott", proof);
      expect(msg.value.contract).toBe(CONTRACTS.clearance);
      const decoded = JSON.parse(atob(msg.value.msg as string));
      expect(decoded.submit_proof.provider).toBe("stott");
    });
  });

  describe("buildMarketplaceListMessages", () => {
    it("returns 3 messages: mint, approve, list_item", () => {
      const result = buildMarketplaceListMessages(
        "xion1seller",
        "token-1",
        "4990000",
        {
          class_id: "class-1",
          title: "My Class",
          description: "Desc",
          method: "mat",
          difficulty: "intermediate",
          duration_minutes: 55,
          instructor_id: "instr-1",
        },
      );
      expect(result.messages).toHaveLength(3);
      expect(result.tokenId).toBe("token-1");

      // Message 1: mint (cw721-base uses Empty extension, metadata in token_uri)
      const mint = result.messages[0];
      expect(mint.value.contract).toBe(CONTRACTS.nft);
      const mintDecoded = JSON.parse(atob(mint.value.msg as string));
      expect(mintDecoded.mint.token_id).toBe("token-1");
      expect(mintDecoded.mint.owner).toBe("xion1seller");
      expect(mintDecoded.mint.extension).toEqual({});
      expect(mintDecoded.mint.token_uri).toMatch(/^data:application\/json;base64,/);
      // Verify metadata is encoded in token_uri
      const uriData = JSON.parse(atob(mintDecoded.mint.token_uri.split(",")[1]));
      expect(uriData.name).toBe("My Class");
      expect(uriData.description).toBe("Desc");

      // Message 2: approve
      const approve = result.messages[1];
      const approveDecoded = JSON.parse(atob(approve.value.msg as string));
      expect(approveDecoded.approve.spender).toBe(CONTRACTS.marketplace);

      // Message 3: list_item
      const list = result.messages[2];
      expect(list.value.contract).toBe(CONTRACTS.marketplace);
      const listDecoded = JSON.parse(atob(list.value.msg as string));
      expect(listDecoded.list_item.collection).toBe(CONTRACTS.nft);
      expect(listDecoded.list_item.token_id).toBe("token-1");
      expect(listDecoded.list_item.price.amount).toBe("4990000");
    });
  });

  describe("buildMarketplacePurchaseMsg", () => {
    it("builds buy_item message with funds", () => {
      const msg = buildMarketplacePurchaseMsg("xion1buyer", "listing-1", "4990000");
      expect(msg.value.contract).toBe(CONTRACTS.marketplace);
      const decoded = JSON.parse(atob(msg.value.msg as string));
      expect(decoded.buy_item.listing_id).toBe("listing-1");
      expect(decoded.buy_item.price.amount).toBe("4990000");
      expect((msg.value.funds as Array<{ amount: string }>)[0].amount).toBe("4990000");
    });
  });

  describe("buildMarketplaceCancelMsg", () => {
    it("builds cancel_listing message", () => {
      const msg = buildMarketplaceCancelMsg("xion1seller", "listing-1");
      expect(msg.value.contract).toBe(CONTRACTS.marketplace);
      const decoded = JSON.parse(atob(msg.value.msg as string));
      expect(decoded.cancel_listing.listing_id).toBe("listing-1");
    });
  });

  describe("submitTransaction", () => {
    it("sends POST with auth header and returns result", async () => {
      const mockResult = {
        transactionHash: "0xabc",
        code: 0,
        gasUsed: "100",
        gasWanted: "200",
      };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await submitTransaction("token123", [
        buildMsgSend("xion1a", "xion1b", "1000"),
      ]);
      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/transaction"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        }),
      );
    });

    it("throws on non-ok response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(
        submitTransaction("bad-token", []),
      ).rejects.toThrow("Transaction failed: Unauthorized");
    });
  });
});
