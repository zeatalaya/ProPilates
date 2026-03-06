import { getContractConfig } from "./config";

export function buildQueryListings(startAfter?: string, limit = 20) {
  return {
    list_listings: { start_after: startAfter, limit },
  };
}

export function buildQueryListingByTokenId(tokenId: string) {
  return {
    listing: { token_id: tokenId },
  };
}

export function buildQueryListingsBySeller(seller: string) {
  return {
    listings_by_seller: { seller },
  };
}

export function buildQueryOwnerOf(tokenId: string) {
  return {
    owner_of: { token_id: tokenId },
  };
}

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
  const { marketplaceContract, usdcDenom } = getContractConfig();
  const tokenId = `propilates-${classId}-${Date.now()}`;
  return {
    contractAddress: marketplaceContract,
    msg: {
      mint_and_list: {
        token_id: tokenId,
        owner: seller,
        token_uri: null,
        extension: {
          class_id: classId,
          ...metadata,
        },
        price: { denom: usdcDenom, amount: priceUsdc },
      },
    },
  };
}

export function buildPurchaseMsg(tokenId: string, priceUsdc: string) {
  const { marketplaceContract, usdcDenom } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { purchase: { token_id: tokenId } },
    funds: [{ denom: usdcDenom, amount: priceUsdc }],
  };
}

export function buildDelistMsg(tokenId: string) {
  const { marketplaceContract } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: { delist: { token_id: tokenId } },
  };
}

export function buildUpdatePriceMsg(tokenId: string, newPriceUsdc: string) {
  const { marketplaceContract, usdcDenom } = getContractConfig();
  return {
    contractAddress: marketplaceContract,
    msg: {
      update_price: {
        token_id: tokenId,
        price: { denom: usdcDenom, amount: newPriceUsdc },
      },
    },
  };
}
