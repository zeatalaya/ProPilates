import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildQueryConfig,
  buildQueryListing,
  buildQueryOffer,
  buildQueryPendingSales,
  buildListItemMsg,
  buildBuyItemMsg,
  buildCancelListingMsg,
  buildCreateOfferMsg,
  buildCancelOfferMsg,
  buildApproveMarketplaceMsg,
  buildMintClassNftMsg,
} from "./marketplace";
import { setContractConfig, getContractConfig } from "./config";

describe("marketplace contract messages", () => {
  let originalConfig: ReturnType<typeof getContractConfig>;

  beforeEach(() => {
    originalConfig = { ...getContractConfig() };
    setContractConfig({
      marketplaceContract: "xion1market",
      nftContract: "xion1nft",
      listingDenom: "uxion",
    });
  });

  afterEach(() => {
    setContractConfig(originalConfig);
  });

  describe("query builders", () => {
    it("buildQueryConfig", () => {
      expect(buildQueryConfig()).toEqual({ config: {} });
    });

    it("buildQueryListing", () => {
      expect(buildQueryListing("listing-1")).toEqual({
        listing: { listing_id: "listing-1" },
      });
    });

    it("buildQueryOffer", () => {
      expect(buildQueryOffer("offer-1")).toEqual({
        offer: { offer_id: "offer-1" },
      });
    });

    it("buildQueryPendingSales with defaults", () => {
      expect(buildQueryPendingSales()).toEqual({ pending_sales: {} });
    });

    it("buildQueryPendingSales with pagination", () => {
      expect(buildQueryPendingSales(5, 10)).toEqual({
        pending_sales: { start_after: 5, limit: 10 },
      });
    });
  });

  describe("buildListItemMsg", () => {
    it("builds list item message", () => {
      const msg = buildListItemMsg(
        "xion1nft",
        "token-1",
        { denom: "uxion", amount: "1000000" },
      );
      expect(msg.contractAddress).toBe("xion1market");
      expect(msg.msg.list_item.collection).toBe("xion1nft");
      expect(msg.msg.list_item.token_id).toBe("token-1");
      expect(msg.msg.list_item.price).toEqual({ denom: "uxion", amount: "1000000" });
      expect(msg.msg.list_item.reserved_for).toBeUndefined();
    });

    it("includes reserved_for when specified", () => {
      const msg = buildListItemMsg(
        "xion1nft",
        "token-1",
        { denom: "uxion", amount: "1000000" },
        "xion1buyer",
      );
      expect(msg.msg.list_item.reserved_for).toBe("xion1buyer");
    });
  });

  describe("buildBuyItemMsg", () => {
    it("builds buy message with funds", () => {
      const price = { denom: "uxion", amount: "1000000" };
      const msg = buildBuyItemMsg("listing-1", price);
      expect(msg.contractAddress).toBe("xion1market");
      expect(msg.msg).toEqual({ buy_item: { listing_id: "listing-1", price } });
      expect(msg.funds).toEqual([price]);
    });
  });

  describe("buildCancelListingMsg", () => {
    it("builds cancel listing message", () => {
      const msg = buildCancelListingMsg("listing-1");
      expect(msg.contractAddress).toBe("xion1market");
      expect(msg.msg).toEqual({ cancel_listing: { listing_id: "listing-1" } });
    });
  });

  describe("buildCreateOfferMsg", () => {
    it("builds offer message with funds", () => {
      const price = { denom: "uxion", amount: "500000" };
      const msg = buildCreateOfferMsg("xion1nft", "token-1", price);
      expect(msg.contractAddress).toBe("xion1market");
      expect(msg.msg.create_offer.collection).toBe("xion1nft");
      expect(msg.msg.create_offer.token_id).toBe("token-1");
      expect(msg.funds).toEqual([price]);
    });
  });

  describe("buildCancelOfferMsg", () => {
    it("builds cancel offer message", () => {
      const msg = buildCancelOfferMsg("offer-1");
      expect(msg.contractAddress).toBe("xion1market");
      expect(msg.msg).toEqual({ cancel_offer: { id: "offer-1" } });
    });
  });

  describe("buildApproveMarketplaceMsg", () => {
    it("builds CW721 approve for marketplace", () => {
      const msg = buildApproveMarketplaceMsg("xion1nft", "token-1");
      expect(msg.contractAddress).toBe("xion1nft");
      expect(msg.msg.approve.spender).toBe("xion1market");
      expect(msg.msg.approve.token_id).toBe("token-1");
    });
  });

  describe("buildMintClassNftMsg", () => {
    it("builds mint message with unique token ID", () => {
      const msg = buildMintClassNftMsg("xion1owner", "class-1", {
        title: "My Class",
        description: "A great class",
        method: "mat",
        difficulty: "intermediate",
        duration_minutes: 55,
      });
      expect(msg.contractAddress).toBe("xion1nft");
      expect(msg.tokenId).toMatch(/^propilates-class-1-.+$/);
      expect(msg.msg.mint.owner).toBe("xion1owner");
      expect(msg.msg.mint.extension.class_id).toBe("class-1");
      expect(msg.msg.mint.extension.title).toBe("My Class");
    });

    it("generates unique token IDs", () => {
      const meta = { title: "A", description: "", method: "mat", difficulty: "beginner", duration_minutes: 30 };
      const msg1 = buildMintClassNftMsg("xion1owner", "class-1", meta);
      const msg2 = buildMintClassNftMsg("xion1owner", "class-1", meta);
      expect(msg1.tokenId).not.toBe(msg2.tokenId);
    });
  });
});
