/**
 * Clearance badge NFT contract interactions.
 * Handles CW721 badge minting and queries for Pilates certification verification.
 *
 * Adapted from the Redacted File (burnt-labs/redacted) clearance contract pattern.
 */

import type { CertificationBadge, BadgeMetadata, VerificationProvider } from "@/types";

const CLEARANCE_CONTRACT = process.env.NEXT_PUBLIC_CLEARANCE_CONTRACT ?? "";
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "";
const XION_REST =
  process.env.NEXT_PUBLIC_XION_REST ?? "https://api.xion-testnet-2.burnt.com";

// ── REST query helper ──

export async function queryContract<T>(
  contractAddress: string,
  queryMsg: Record<string, unknown>,
): Promise<T> {
  const base64Query = btoa(JSON.stringify(queryMsg));
  const res = await fetch(
    `${XION_REST}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${base64Query}`,
  );
  if (!res.ok) {
    throw new Error(`Contract query failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

// ── Query builders ──

export function buildQueryBadgeCount() {
  return { num_tokens: {} };
}

export function buildQueryIsVerified(address: string) {
  return { tokens: { owner: address, limit: 1 } };
}

export function buildQueryUserTokens(address: string, limit = 10) {
  return { tokens: { owner: address, limit } };
}

export function buildQueryBadgeInfo(tokenId: string) {
  return { nft_info: { token_id: tokenId } };
}

export function buildQueryAllBadges(startAfter?: string, limit = 50) {
  return {
    all_tokens: {
      start_after: startAfter,
      limit,
    },
  };
}

export function buildQueryOwnerOf(tokenId: string) {
  return { owner_of: { token_id: tokenId } };
}

// ── Execute message builders ──

/**
 * Build a message to submit a certification proof and mint a badge.
 * Requires MsgExecuteContract grant for CLEARANCE_CONTRACT in the Treasury.
 */
export function buildMintBadgeMsg(
  sender: string,
  provider: string,
  proofData: {
    claimInfo: Record<string, unknown>;
    signedClaim: Record<string, unknown>;
  },
) {
  return {
    contractAddress: CLEARANCE_CONTRACT,
    msg: {
      submit_proof: {
        provider,
        claim_info: proofData.claimInfo,
        signed_claim: proofData.signedClaim,
      },
    },
  };
}

// ── High-level query functions ──

export async function getBadgeCount(): Promise<number> {
  if (!NFT_CONTRACT) return 0;
  try {
    const result = await queryContract<{ count: number }>(
      NFT_CONTRACT,
      buildQueryBadgeCount(),
    );
    return result.count;
  } catch {
    return 0;
  }
}

export async function isVerified(address: string): Promise<boolean> {
  if (!NFT_CONTRACT) return false;
  try {
    const result = await queryContract<{ tokens: string[] }>(
      NFT_CONTRACT,
      buildQueryIsVerified(address),
    );
    return result.tokens.length > 0;
  } catch {
    return false;
  }
}

export async function getUserBadge(
  address: string,
): Promise<CertificationBadge | null> {
  if (!NFT_CONTRACT) return null;
  try {
    const tokensResult = await queryContract<{ tokens: string[] }>(
      NFT_CONTRACT,
      buildQueryUserTokens(address, 1),
    );
    if (tokensResult.tokens.length === 0) return null;

    const tokenId = tokensResult.tokens[0];
    const info = await queryContract<{
      token_uri: string | null;
      extension: BadgeMetadata;
    }>(NFT_CONTRACT, buildQueryBadgeInfo(tokenId));

    const provider =
      (info.extension.attributes.find((a) => a.trait_type === "provider")
        ?.value as VerificationProvider) ?? "other";
    const certifiedAt =
      info.extension.attributes.find((a) => a.trait_type === "certified_at")
        ?.value ?? "";
    const txHash =
      info.extension.attributes.find((a) => a.trait_type === "tx_hash")
        ?.value ?? "";

    return {
      tokenId,
      owner: address,
      provider,
      certifiedAt,
      txHash,
      metadata: info.extension,
    };
  } catch {
    return null;
  }
}

export async function getAllBadges(
  startAfter?: string,
  limit = 50,
): Promise<CertificationBadge[]> {
  if (!NFT_CONTRACT) return [];
  try {
    const tokensResult = await queryContract<{ tokens: string[] }>(
      NFT_CONTRACT,
      buildQueryAllBadges(startAfter, limit),
    );

    const badges: CertificationBadge[] = [];
    for (const tokenId of tokensResult.tokens) {
      try {
        const [info, ownerResult] = await Promise.all([
          queryContract<{
            token_uri: string | null;
            extension: BadgeMetadata;
          }>(NFT_CONTRACT, buildQueryBadgeInfo(tokenId)),
          queryContract<{ owner: string }>(
            NFT_CONTRACT,
            buildQueryOwnerOf(tokenId),
          ),
        ]);

        const provider =
          (info.extension.attributes.find((a) => a.trait_type === "provider")
            ?.value as VerificationProvider) ?? "other";
        const certifiedAt =
          info.extension.attributes.find((a) => a.trait_type === "certified_at")
            ?.value ?? "";
        const txHash =
          info.extension.attributes.find((a) => a.trait_type === "tx_hash")
            ?.value ?? "";

        badges.push({
          tokenId,
          owner: ownerResult.owner,
          provider,
          certifiedAt,
          txHash,
          metadata: info.extension,
        });
      } catch {
        // Skip badges with query errors
      }
    }
    return badges;
  } catch {
    return [];
  }
}

export { CLEARANCE_CONTRACT, NFT_CONTRACT };
