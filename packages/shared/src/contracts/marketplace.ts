/**
 * xion_nft_marketplace contract message builders.
 *
 * Based on burnt-labs/contracts marketplace (code ID 1879 on xion-testnet-2).
 *
 * ExecuteMsg: list_item, buy_item, cancel_listing, create_offer, accept_offer,
 *             create_collection_offer, accept_collection_offer, cancel_offer,
 *             cancel_collection_offer, approve_sale, reject_sale, update_config
 * QueryMsg:   config, listing, offer, collection_offer, pending_sale, pending_sales
 *
 * Listing flow:
 *   1. Mint NFT on CW721 contract
 *   2. Approve marketplace to transfer (cw721 approve msg)
 *   3. Call list_item on marketplace
 *   4. Buyer calls buy_item with funds attached
 */

import { getContractConfig } from "./config";

// ── Types matching the real contract ──

export interface Coin {
  denom: string;
  amount: string;
}

export type ListingStatus = "Active" | "Reserved";

export type SaleType = "BuyNow" | "TokenOffer" | "CollectionOffer";

export interface Listing {
  id: string;
  collection: string;
  token_id: string;
  price: Coin;
  asset_price: Coin;
  seller: string;
  reserved_for: string | null;
  status: ListingStatus;
}

export interface PendingSale {
  id: string;
  collection: string;
  token_id: string;
  price: Coin;
  seller: string;
  buyer: string;
  recipient: string;
  sale_type: SaleType;
  time: number;
  expiration: number;
}

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

/** Get a collection offer by its ID */
export function buildQueryCollectionOffer(collectionOfferId: string) {
  return { collection_offer: { collection_offer_id: collectionOfferId } };
}

/** Get a pending sale by its ID */
export function buildQueryPendingSale(id: string) {
  return { pending_sale: { id } };
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
 * Prerequisites:
 *   - The NFT must be minted on the CW721 contract
 *   - The marketplace must be approved to transfer the NFT (cw721 approve)
 *
 * @param collection - CW721 contract address (NFT collection)
 * @param tokenId - Token ID being listed
 * @param price - Price as a Coin (e.g. {denom: "uxion", amount: "1000000"})
 * @param reservedFor - Optional buyer address to restrict purchase to
 */
export function buildListItemMsg(
  collection: string,
  tokenId: string,
  price: Coin,
  reservedFor?: string,
) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
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
 * Buy a listed NFT. Must attach the listing price as funds.
 */
export function buildBuyItemMsg(listingId: string, price: Coin) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { buy_item: { listing_id: listingId, price } },
    funds: [price],
  };
}

/**
 * Cancel a listing. Only the seller can cancel.
 */
export function buildCancelListingMsg(listingId: string) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { cancel_listing: { listing_id: listingId } },
  };
}

/**
 * Create an offer on a specific NFT. Attach funds with the message.
 */
export function buildCreateOfferMsg(
  collection: string,
  tokenId: string,
  price: Coin,
) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { create_offer: { collection, token_id: tokenId, price } },
    funds: [price],
  };
}

/**
 * Accept an offer. Only the NFT owner can accept.
 */
export function buildAcceptOfferMsg(
  id: string,
  collection: string,
  tokenId: string,
  price: Coin,
) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { accept_offer: { id, collection, token_id: tokenId, price } },
  };
}

/**
 * Cancel an offer. Only the offer creator can cancel.
 */
export function buildCancelOfferMsg(id: string) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { cancel_offer: { id } },
  };
}

// ── ProPilates convenience helpers ──

/**
 * Build a CW721 approve message to allow the marketplace to transfer an NFT.
 */
export function buildApproveMarketplaceMsg(
  collection: string,
  tokenId: string,
) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: collection,
    msg: {
      approve: {
        spender: marketplaceContract,
        token_id: tokenId,
        expires: null,
      },
    },
  };
}

/**
 * Build a CW721 mint message for a class NFT.
 */
export function buildMintClassNftMsg(
  owner: string,
  classId: string,
  metadata: {
    title: string;
    description: string;
    method: string;
    difficulty: string;
    duration_minutes: number;
  },
) {
  const { nftContract } = getContractConfig();
  const tokenId = `propilates-${classId}-${crypto.randomUUID()}`;
  return {
    tokenId,
    contractAddress: nftContract,
    msg: {
      mint: {
        token_id: tokenId,
        owner,
        token_uri: null,
        extension: { class_id: classId, ...metadata },
      },
    },
  };
}
