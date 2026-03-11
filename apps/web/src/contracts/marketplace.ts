/**
 * xion_nft_marketplace contract message builders (web-specific).
 *
 * Uses env vars for contract addresses. For the shared package version
 * that uses getContractConfig(), see packages/shared/src/contracts/marketplace.ts.
 *
 * Based on burnt-labs/contracts marketplace (code ID 1879 on xion-testnet-2).
 *
 * Listing flow:
 *   1. Mint NFT on CW721 contract
 *   2. Approve marketplace to transfer (cw721 approve msg)
 *   3. Call list_item on marketplace
 *   4. Buyer calls buy_item with funds attached
 */

export const MARKETPLACE_CONTRACT =
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "";
export const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "";
export const LISTING_DENOM =
  process.env.NEXT_PUBLIC_USDC_DENOM ?? "uxion";

// ── Types matching the real contract ──

export interface Coin {
  denom: string;
  amount: string;
}

export type ListingStatus = "Active" | "Reserved";

// ── Query message builders ──

/** Get marketplace configuration */
export function buildQueryConfig() {
  return { config: {} };
}

/** Get a listing by its ID */
export function buildQueryListing(listingId: string) {
  return { listing: { listing_id: listingId } };
}

/** Get an offer by its ID */
export function buildQueryOffer(offerId: string) {
  return { offer: { offer_id: offerId } };
}

/** Get paginated pending sales */
export function buildQueryPendingSales(startAfter?: number, limit?: number) {
  return {
    pending_sales: {
      ...(startAfter != null && { start_after: startAfter }),
      ...(limit != null && { limit }),
    },
  };
}

// ── Execute message builders ──

/**
 * List an NFT for sale on the marketplace.
 *
 * @param collection - CW721 contract address
 * @param tokenId - Token ID being listed
 * @param priceAmount - Price amount in listing denom (e.g. "1000000" for 1 XION)
 * @param reservedFor - Optional buyer address restriction
 */
export function buildListItemMsg(
  collection: string,
  tokenId: string,
  priceAmount: string,
  reservedFor?: string,
) {
  const price: Coin = { denom: LISTING_DENOM, amount: priceAmount };
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      list_item: {
        collection,
        token_id: tokenId,
        price,
        ...(reservedFor && { reserved_for: reservedFor }),
      },
    },
  };
}

/**
 * Buy a listed NFT. Attaches the price as funds.
 */
export function buildBuyItemMsg(listingId: string, priceAmount: string) {
  const price: Coin = { denom: LISTING_DENOM, amount: priceAmount };
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: { buy_item: { listing_id: listingId, price } },
    funds: [price],
  };
}

/**
 * Cancel a listing. Only the seller can cancel.
 */
export function buildCancelListingMsg(listingId: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: { cancel_listing: { listing_id: listingId } },
  };
}

/**
 * Create an offer on a specific NFT. Attach funds with the message.
 */
export function buildCreateOfferMsg(
  collection: string,
  tokenId: string,
  priceAmount: string,
) {
  const price: Coin = { denom: LISTING_DENOM, amount: priceAmount };
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: { create_offer: { collection, token_id: tokenId, price } },
    funds: [price],
  };
}

/**
 * Cancel an offer.
 */
export function buildCancelOfferMsg(id: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: { cancel_offer: { id } },
  };
}

// ── CW721 helpers ──

/**
 * Approve marketplace to transfer an NFT.
 */
export function buildApproveMsg(tokenId: string) {
  return {
    contractAddress: NFT_CONTRACT,
    msg: {
      approve: {
        spender: MARKETPLACE_CONTRACT,
        token_id: tokenId,
        expires: null,
      },
    },
  };
}
