/**
 * CW721-marketplace-permissioned contract message builders.
 * NFT-based portfolio access for buying/selling instructor class plans.
 */

const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "";

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
 * Mint a new portfolio NFT for a class and list it on the marketplace
 */
export function buildMintAndListMsg(
  seller: string,
  classId: string,
  priceUxion: string,
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
          denom: "uxion",
          amount: priceUxion,
        },
      },
    },
  };
}

/**
 * Purchase access to a listed portfolio class
 */
export function buildPurchaseMsg(tokenId: string, priceUxion: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      purchase: {
        token_id: tokenId,
      },
    },
    funds: [
      {
        denom: "uxion",
        amount: priceUxion,
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
 * Update listing price
 */
export function buildUpdatePriceMsg(tokenId: string, newPriceUxion: string) {
  return {
    contractAddress: MARKETPLACE_CONTRACT,
    msg: {
      update_price: {
        token_id: tokenId,
        price: {
          denom: "uxion",
          amount: newPriceUxion,
        },
      },
    },
  };
}

export { MARKETPLACE_CONTRACT };
