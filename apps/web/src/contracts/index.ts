// Re-export contract modules. Import directly from the specific module
// when you need a specific function to avoid name collisions.
// e.g. import { buildCreateSwapMsg } from "@/contracts/marketplace";

export * from "./treasury";

// Marketplace — re-export non-conflicting items (USDC_DENOM comes from treasury)
export {
  MARKETPLACE_CONTRACT,
  NFT_CONTRACT,
  buildCreateSwapMsg,
  buildFinishSwapMsg,
  buildCancelSwapMsg,
  buildUpdateSwapMsg,
  buildQueryGetListings,
  buildQueryGetOffers,
  buildQuerySwapsOf,
  buildQueryDetails,
  buildQueryGetTotal,
  buildQueryListingsOfToken,
  buildQuerySwapsByPrice,
  buildQueryConfig,
} from "./marketplace";

export type {
  SwapType,
  Expiration,
  SwapMsg,
  FinishSwapMsg,
  CancelMsg,
  UpdateSwapMsg,
} from "./marketplace";

// NFT (CW721) — re-export non-conflicting items
export {
  buildMintMsg,
  buildApproveMsg,
  buildRevokeMsg,
  buildTransferMsg,
  buildQueryNftInfo,
  buildQueryTokens,
  buildQueryAllTokens,
  buildQueryContractInfo,
} from "./nft";

export type { ClassNftMetadata } from "./nft";

export * from "./reclaim";

// Clearance — re-export non-conflicting items (NFT_CONTRACT, buildQueryOwnerOf conflict)
export {
  CLEARANCE_CONTRACT,
  queryContract,
  buildQueryBadgeCount,
  buildQueryIsVerified,
  buildQueryUserTokens,
  buildQueryBadgeInfo,
  buildQueryAllBadges,
  buildMintBadgeMsg,
  getBadgeCount,
  isVerified,
  getUserBadge,
  getAllBadges,
} from "./clearance";
