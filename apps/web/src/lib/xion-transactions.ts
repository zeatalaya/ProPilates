/**
 * XION Transaction Helper
 *
 * Submits transactions to the XION blockchain via the Abstraxion OAuth2 API.
 * Uses the OAuth access token to authenticate and execute pre-approved
 * transactions through the Treasury contract's grant system.
 *
 * ## How It Works
 *
 * 1. User authenticates via Abstraxion → gets access_token
 * 2. Treasury contract has pre-configured grants:
 *    - Fee Grant: covers gas fees (gasless for user)
 *    - Authz Grant: MsgSend (USDC transfers) + MsgExecuteContract
 *      for specific contracts (marketplace, reclaim, etc.)
 * 3. POST to `/api/v1/transaction` with Cosmos SDK messages
 * 4. Abstraxion server validates grants and broadcasts to XION
 *
 * ## Required Treasury Grant Configuration
 *
 * At https://dev.testnet.burnt.com, your Treasury contract needs:
 *
 * **Fee Grant:**
 * - Allowance Type: BasicAllowance
 * - Spend Limit: 1000uxion (or appropriate amount)
 *
 * **Authorization Grants:**
 * - Permission: MsgSend (for USDC transfers)
 * - Permission: MsgExecuteContract → RECLAIM_CONTRACT
 *   (for on-chain credential verification via Reclaim ZK proofs)
 * - Permission: MsgExecuteContract → MARKETPLACE_CONTRACT
 *   (for listing/purchasing class portfolios as NFTs)
 *
 * Docs: https://docs.burnt.com/xion/developers/getting-started-advanced/gasless-ux-and-permission-grants/treasury-contracts
 * OAuth2 Demo: https://github.com/burnt-labs/xion-oauth2-app-demo
 */

const OAUTH3_SERVER =
  process.env.NEXT_PUBLIC_OAUTH3_SERVER ?? "https://oauth2.testnet.burnt.com";

// Contract addresses that need Authorization Grants in the Treasury
export const CONTRACTS = {
  treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT ?? "",
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "",
  reclaim:
    process.env.NEXT_PUBLIC_RECLAIM_CONTRACT ??
    "xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e",
  clearance: process.env.NEXT_PUBLIC_CLEARANCE_CONTRACT ?? "",
  nft: process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "",
} as const;

interface TransactionMessage {
  typeUrl: string;
  value: Record<string, unknown>;
}

interface TransactionResult {
  transactionHash: string;
  code: number;
  gasUsed: string;
  gasWanted: string;
}

/**
 * Submit a transaction to XION via the Abstraxion OAuth2 API.
 *
 * The access token must have the `xion:transactions:submit` scope.
 * The Treasury contract associated with your OAuth2 client determines
 * which message types are allowed (via Authorization Grants).
 * Gas is covered by the Treasury's Fee Grant — users pay nothing.
 *
 * @param accessToken - OAuth2 access token from Abstraxion login
 * @param messages - Array of Cosmos SDK messages (must be pre-approved by Treasury grants)
 */
export async function submitTransaction(
  accessToken: string,
  messages: TransactionMessage[],
): Promise<TransactionResult> {
  const res = await fetch(`${OAUTH3_SERVER}/api/v1/transaction`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Transaction failed: ${error}`);
  }

  return res.json();
}

// ── Message Builders ──
// These create Cosmos SDK messages that match the Treasury's Authorization Grants.

/**
 * Build a MsgSend for transferring tokens (USDC, XION, etc.)
 *
 * Requires a MsgSend Authorization Grant in the Treasury contract.
 */
export function buildMsgSend(
  fromAddress: string,
  toAddress: string,
  amount: string,
  denom: string = process.env.NEXT_PUBLIC_USDC_DENOM ?? "ibc/usdc",
): TransactionMessage {
  return {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress,
      toAddress,
      amount: [{ denom, amount }],
    },
  };
}

/**
 * Build a MsgExecuteContract for interacting with a CosmWasm smart contract.
 *
 * Requires a MsgExecuteContract Authorization Grant in the Treasury contract
 * with the target contract address whitelisted (ContractExecutionAuthorization).
 *
 * @param sender - User's Meta Account address (from getMetaAccount)
 * @param contract - Target contract address (must be in Treasury's grants)
 * @param msg - Contract execute message (JSON)
 * @param funds - Optional funds to send with the execution
 */
export function buildMsgExecuteContract(
  sender: string,
  contract: string,
  msg: Record<string, unknown>,
  funds: Array<{ denom: string; amount: string }> = [],
): TransactionMessage {
  return {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: {
      sender,
      contract,
      msg: btoa(JSON.stringify(msg)),
      funds,
    },
  };
}

// ── ProPilates-specific transaction helpers ──

/**
 * Submit a Reclaim ZK proof to verify a Pilates certification on-chain.
 *
 * Requires MsgExecuteContract grant for RECLAIM_CONTRACT in the Treasury.
 */
export function buildReclaimVerifyMsg(
  sender: string,
  instructor: string,
  provider: string,
  proofData: {
    claimInfo: Record<string, unknown>;
    signedClaim: Record<string, unknown>;
  },
): TransactionMessage {
  return buildMsgExecuteContract(sender, CONTRACTS.reclaim, {
    verify_proof: {
      instructor,
      provider,
      claim_info: proofData.claimInfo,
      signed_claim: proofData.signedClaim,
    },
  });
}

/**
 * Submit a certification proof to mint a badge NFT via the clearance contract.
 *
 * Requires MsgExecuteContract grant for CLEARANCE_CONTRACT in the Treasury.
 */
export function buildClearanceMintMsg(
  sender: string,
  provider: string,
  proofData: {
    claimInfo: Record<string, unknown>;
    signedClaim: Record<string, unknown>;
  },
): TransactionMessage {
  return buildMsgExecuteContract(sender, CONTRACTS.clearance, {
    submit_proof: {
      provider,
      claim_info: proofData.claimInfo,
      signed_claim: proofData.signedClaim,
    },
  });
}

/**
 * Build the 3-message transaction to list a class NFT on the marketplace.
 *
 * Uses the xion_nft_marketplace contract flow:
 *   Step 1: Mint the NFT on the CW721 contract
 *   Step 2: Approve marketplace to transfer the NFT
 *   Step 3: Call list_item on the marketplace
 *
 * All 3 messages are submitted as a single atomic transaction.
 * Requires MsgExecuteContract grants for both NFT_CONTRACT and MARKETPLACE_CONTRACT.
 */
export function buildMarketplaceListMessages(
  sender: string,
  tokenId: string,
  priceAmount: string,
  metadata: {
    class_id: string;
    title: string;
    description: string;
    method: string;
    difficulty: string;
    duration_minutes: number;
    instructor_id: string;
  },
): { tokenId: string; messages: TransactionMessage[] } {
  const nftContract = CONTRACTS.nft;
  const marketplaceContract = CONTRACTS.marketplace;
  const denom = process.env.NEXT_PUBLIC_USDC_DENOM ?? "uxion";

  // Step 1: Mint the class NFT on CW721
  const mintMsg = buildMsgExecuteContract(sender, nftContract, {
    mint: {
      token_id: tokenId,
      owner: sender,
      token_uri: null,
      extension: metadata,
    },
  });

  // Step 2: Approve marketplace to transfer the NFT
  const approveMsg = buildMsgExecuteContract(sender, nftContract, {
    approve: {
      spender: marketplaceContract,
      token_id: tokenId,
      expires: null,
    },
  });

  // Step 3: List item on marketplace
  const listMsg = buildMsgExecuteContract(sender, marketplaceContract, {
    list_item: {
      collection: nftContract,
      token_id: tokenId,
      price: { denom, amount: priceAmount },
    },
  });

  return {
    tokenId,
    messages: [mintMsg, approveMsg, listMsg],
  };
}

/**
 * Purchase an NFT from the marketplace (buy_item).
 *
 * Must attach the listing price as funds.
 * Requires MsgExecuteContract grant for MARKETPLACE_CONTRACT in the Treasury.
 */
export function buildMarketplacePurchaseMsg(
  sender: string,
  listingId: string,
  priceAmount: string,
): TransactionMessage {
  const denom = process.env.NEXT_PUBLIC_USDC_DENOM ?? "uxion";
  const price = { denom, amount: priceAmount };
  return buildMsgExecuteContract(
    sender,
    CONTRACTS.marketplace,
    { buy_item: { listing_id: listingId, price } },
    [price],
  );
}

/**
 * Cancel a marketplace listing.
 * Only the listing creator can cancel.
 * Requires MsgExecuteContract grant for MARKETPLACE_CONTRACT in the Treasury.
 */
export function buildMarketplaceCancelMsg(
  sender: string,
  listingId: string,
): TransactionMessage {
  return buildMsgExecuteContract(sender, CONTRACTS.marketplace, {
    cancel_listing: { listing_id: listingId },
  });
}
