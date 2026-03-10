/**
 * cw721-marketplace-permissioned contract message builders.
 *
 * Based on the XION marketplace contract:
 * https://docs.burnt.com/xion/developers/re-using-existing-contracts/marketplace
 * https://docs.rs/cw721-marketplace-permissioned/0.1.7
 *
 * ExecuteMsg: Create, Finish, Cancel, Update, UpdateConfig, AddNft, RemoveNft, Withdraw
 * QueryMsg:   GetListings, GetOffers, SwapsOf, Details, Config, GetTotal, etc.
 *
 * Listing flow:
 *   1. Mint NFT on CW721 contract        (see nft.ts → buildMintMsg)
 *   2. Approve marketplace to transfer    (see nft.ts → buildApproveMsg)
 *   3. Create a swap (listing) here       (buildCreateSwapMsg)
 *   4. Buyer calls Finish to purchase     (buildFinishSwapMsg)
 */

export const MARKETPLACE_CONTRACT =
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "";
export const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "";
export const USDC_DENOM =
  process.env.NEXT_PUBLIC_USDC_DENOM ?? "ibc/usdc";

// ── Types matching the real contract ──

export type SwapType = "sale" | "offer";

export type Expiration =
  | { at_height: number }
  | { at_time: string } // nanoseconds as string
  | { never: Record<string, never> };

export interface SwapMsg {
  id: string;
  cw721: string;
  payment_token: string | null; // null = native token
  token_id: string;
  expires: Expiration;
  price: string; // Uint128 as string
  swap_type: SwapType;
}

export interface FinishSwapMsg {
  id: string;
}

export interface CancelMsg {
  id: string;
}

export interface UpdateSwapMsg {
  id: string;
  expires: Expiration;
  price: string; // Uint128 as string
}

// ── Execute message builders ──

/**
 * Create a swap (list an NFT for sale on the marketplace).
 *
 * Prerequisites:
 *   - The NFT must already be minted on the CW721 contract
 *   - The marketplace must be approved to transfer the NFT
 *   - The CW721 contract must be on the marketplace's approved list
 *
 * @param tokenId - CW721 token ID being listed
 * @param priceUsdc - Price in micro-USDC (6 decimals), e.g. "4990000" for $4.99
 * @param expiresInDays - Days until listing expires (0 = never)
 */
export function buildCreateSwapMsg(
  tokenId: string,
  priceUsdc: string,
  expiresInDays: number = 0,
) {
  const swapId = `propilates-${tokenId}-${Date.now()}`;

  const expires: Expiration =
    expiresInDays > 0
      ? {
          at_time: String(
            (Math.floor(Date.now() / 1000) + expiresInDays * 86400) *
              1_000_000_000,
          ),
        }
      : { never: {} };

  return {
    swapId,
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      create: {
        id: swapId,
        cw721: NFT_CONTRACT,
        payment_token: null,
        token_id: tokenId,
        expires,
        price: priceUsdc,
        swap_type: "sale" as SwapType,
      } satisfies SwapMsg,
    },
  };
}

/**
 * Finish a swap (purchase an NFT from the marketplace).
 * Must attach the listing price as native USDC funds.
 *
 * @param swapId - The swap/listing ID to purchase
 * @param priceUsdc - Price in micro-USDC to attach as funds
 */
export function buildFinishSwapMsg(swapId: string, priceUsdc: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      finish: {
        id: swapId,
      } satisfies FinishSwapMsg,
    },
    funds: [
      {
        denom: USDC_DENOM,
        amount: priceUsdc,
      },
    ],
  };
}

/**
 * Cancel a swap (remove listing from marketplace).
 * Only the listing creator can cancel.
 */
export function buildCancelSwapMsg(swapId: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      cancel: {
        id: swapId,
      } satisfies CancelMsg,
    },
  };
}

/**
 * Update a swap's price and/or expiration.
 * Only the listing creator can update.
 */
export function buildUpdateSwapMsg(
  swapId: string,
  newPriceUsdc: string,
  expiresInDays: number = 0,
) {
  const expires: Expiration =
    expiresInDays > 0
      ? {
          at_time: String(
            (Math.floor(Date.now() / 1000) + expiresInDays * 86400) *
              1_000_000_000,
          ),
        }
      : { never: {} };

  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      update: {
        id: swapId,
        expires,
        price: newPriceUsdc,
      } satisfies UpdateSwapMsg,
    },
  };
}

// ── Query message builders ──

/** Get paginated sale listings */
export function buildQueryGetListings(page?: number, limit?: number) {
  return {
    get_listings: {
      ...(page != null && { page }),
      ...(limit != null && { limit }),
    },
  };
}

/** Get paginated offers (bids) */
export function buildQueryGetOffers(page?: number, limit?: number) {
  return {
    get_offers: {
      ...(page != null && { page }),
      ...(limit != null && { limit }),
    },
  };
}

/** Get all swaps by a specific address */
export function buildQuerySwapsOf(
  address: string,
  swapType?: SwapType,
  page?: number,
  limit?: number,
) {
  return {
    swaps_of: {
      address,
      ...(swapType && { swap_type: swapType }),
      ...(page != null && { page }),
      ...(limit != null && { limit }),
    },
  };
}

/** Get swap details by ID */
export function buildQueryDetails(swapId: string) {
  return {
    details: { id: swapId },
  };
}

/** Get total number of swaps */
export function buildQueryGetTotal(swapType?: SwapType) {
  return {
    get_total: {
      ...(swapType && { swap_type: swapType }),
    },
  };
}

/** Get listings for a specific token */
export function buildQueryListingsOfToken(
  tokenId: string,
  cw721: string = NFT_CONTRACT,
  swapType?: SwapType,
  page?: number,
  limit?: number,
) {
  return {
    listings_of_token: {
      token_id: tokenId,
      cw721,
      ...(swapType && { swap_type: swapType }),
      ...(page != null && { page }),
      ...(limit != null && { limit }),
    },
  };
}

/** Get swaps filtered by price range */
export function buildQuerySwapsByPrice(
  min?: string,
  max?: string,
  swapType?: SwapType,
  page?: number,
  limit?: number,
) {
  return {
    swaps_by_price: {
      ...(min && { min }),
      ...(max && { max }),
      ...(swapType && { swap_type: swapType }),
      ...(page != null && { page }),
      ...(limit != null && { limit }),
    },
  };
}

/** Get marketplace configuration */
export function buildQueryConfig() {
  return { config: {} };
}
