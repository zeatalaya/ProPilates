/**
 * CW721 NFT contract message builders.
 *
 * Standard cw721-base messages for minting and managing ProPilates class NFTs.
 * https://github.com/CosmWasm/cw-nfts
 * https://docs.rs/cw721-base/latest/cw721_base/msg/enum.ExecuteMsg.html
 *
 * Each class listed on the marketplace is represented as a CW721 NFT.
 * The metadata extension stores class details (title, method, difficulty, etc.).
 */

import { NFT_CONTRACT, MARKETPLACE_CONTRACT } from "./marketplace";

// ── Types matching cw721-base ──

export interface ClassNftMetadata {
  class_id: string;
  title: string;
  description: string;
  method: string;
  difficulty: string;
  duration_minutes: number;
  instructor_id: string;
}

// ── Execute message builders ──

/**
 * Mint a new class NFT.
 *
 * Only the contract minter (Treasury or admin) can call this.
 * Requires MsgExecuteContract grant for NFT_CONTRACT in the Treasury.
 *
 * @param owner - Address that will own the NFT (instructor's XION address)
 * @param tokenId - Unique token ID for the NFT
 * @param metadata - Class metadata stored on-chain as the extension
 */
export function buildMintMsg(
  owner: string,
  tokenId: string,
  metadata: ClassNftMetadata,
) {
  return {
    contractAddress: NFT_CONTRACT,
    msg: {
      mint: {
        token_id: tokenId,
        owner,
        token_uri: null,
        extension: metadata,
      },
    },
  };
}

/**
 * Approve the marketplace contract to transfer a specific NFT.
 *
 * Must be called by the NFT owner before creating a marketplace swap.
 * Required step before listing on the marketplace.
 *
 * @param tokenId - The token ID to approve for transfer
 */
export function buildApproveMsg(tokenId: string) {
  return {
    contractAddress: NFT_CONTRACT,
    msg: {
      approve: {
        spender: MARKETPLACE_CONTRACT,
        token_id: tokenId,
        expires: null, // no expiration on the approval
      },
    },
  };
}

/**
 * Revoke marketplace approval for a specific NFT.
 * Use after delisting from marketplace.
 */
export function buildRevokeMsg(tokenId: string) {
  return {
    contractAddress: NFT_CONTRACT,
    msg: {
      revoke: {
        spender: MARKETPLACE_CONTRACT,
        token_id: tokenId,
      },
    },
  };
}

/**
 * Transfer an NFT to a new owner.
 * Used for direct transfers outside the marketplace.
 */
export function buildTransferMsg(recipient: string, tokenId: string) {
  return {
    contractAddress: NFT_CONTRACT,
    msg: {
      transfer_nft: {
        recipient,
        token_id: tokenId,
      },
    },
  };
}

// ── Query message builders ──

/** Query the owner of a specific token */
export function buildQueryOwnerOf(tokenId: string) {
  return {
    owner_of: {
      token_id: tokenId,
      include_expired: false,
    },
  };
}

/** Query NFT info (metadata) for a specific token */
export function buildQueryNftInfo(tokenId: string) {
  return {
    nft_info: {
      token_id: tokenId,
    },
  };
}

/** Query all tokens owned by an address */
export function buildQueryTokens(owner: string, startAfter?: string, limit?: number) {
  return {
    tokens: {
      owner,
      ...(startAfter && { start_after: startAfter }),
      ...(limit != null && { limit }),
    },
  };
}

/** Query all tokens in the collection */
export function buildQueryAllTokens(startAfter?: string, limit?: number) {
  return {
    all_tokens: {
      ...(startAfter && { start_after: startAfter }),
      ...(limit != null && { limit }),
    },
  };
}

/** Query contract info (name, symbol) */
export function buildQueryContractInfo() {
  return { contract_info: {} };
}
