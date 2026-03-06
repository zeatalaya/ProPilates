/**
 * CW721-marketplace-permissioned contract message builders.
 * NFT-based portfolio access for buying/selling instructor class plans.
 * Payments in USDC via Crossmint hosted checkout.
 */

const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "";
const USDC_DENOM = process.env.NEXT_PUBLIC_USDC_DENOM ?? "ibc/usdc";

// ── Query messages ──

export function buildQueryListings(startAfter?: string, limit = 20) {
  return {
    list_listings: {
      start_after: startAfter,
      limit,
    },
  };
}

export function buildQueryListingByTokenId(tokenId: string) {
  return {
    listing: {
      token_id: tokenId,
    },
  };
}

export function buildQueryListingsBySeller(seller: string) {
  return {
    listings_by_seller: {
      seller,
    },
  };
}

export function buildQueryOwnerOf(tokenId: string) {
  return {
    owner_of: {
      token_id: tokenId,
    },
  };
}

// ── Execute messages ──

/**
 * Mint a new portfolio NFT for a class and list it on the marketplace.
 * Price is in USDC (micro units, 6 decimals).
 */
export function buildMintAndListMsg(
  seller: string,
  classId: string,
  priceUsdc: string,
  metadata: {
    title: string;
    description: string;
    method: string;
    difficulty: string;
    duration_minutes: number;
  },
) {
  const tokenId = `propilates-${classId}-${Date.now()}`;
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      mint_and_list: {
        token_id: tokenId,
        owner: seller,
        token_uri: null,
        extension: {
          class_id: classId,
          ...metadata,
        },
        price: {
          denom: USDC_DENOM,
          amount: priceUsdc,
        },
      },
    },
  };
}

/**
 * Purchase access to a listed portfolio class (USDC)
 */
export function buildPurchaseMsg(tokenId: string, priceUsdc: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      purchase: {
        token_id: tokenId,
      },
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
 * Delist a portfolio from the marketplace
 */
export function buildDelistMsg(tokenId: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      delist: {
        token_id: tokenId,
      },
    },
  };
}

/**
 * Update listing price (USDC)
 */
export function buildUpdatePriceMsg(tokenId: string, newPriceUsdc: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      update_price: {
        token_id: tokenId,
        price: {
          denom: USDC_DENOM,
          amount: newPriceUsdc,
        },
      },
    },
  };
}

export { MARKETPLACE_CONTRACT, USDC_DENOM };
