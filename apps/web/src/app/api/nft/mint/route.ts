import { NextRequest, NextResponse } from "next/server";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

const RPC = process.env.NEXT_PUBLIC_XION_RPC ?? "https://rpc.xion-testnet-2.burnt.com:443";
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "";
const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "";
const LISTING_DENOM = "uxion"; // Marketplace was initialized with uxion as listing denom
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "";

/**
 * POST /api/nft/mint
 *
 * Server-side NFT minting + marketplace listing using the deployer key.
 * The deployer is the CW721 minter, mints the NFT, approves the marketplace,
 * and creates the listing — all in one atomic transaction.
 *
 * Body: { tokenId, priceAmount, metadata: { title, description, ... } }
 * Returns: { tokenId, txHash }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, priceAmount, metadata } = body;

    if (!tokenId || !priceAmount || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields: tokenId, priceAmount, metadata" },
        { status: 400 },
      );
    }

    if (!DEPLOYER_KEY || !NFT_CONTRACT || !MARKETPLACE_CONTRACT) {
      return NextResponse.json(
        { error: "Server not configured for minting" },
        { status: 500 },
      );
    }

    // Create signing client from deployer private key
    const keyBytes = Uint8Array.from(Buffer.from(DEPLOYER_KEY, "hex"));
    const wallet = await DirectSecp256k1Wallet.fromKey(keyBytes, "xion");
    const [account] = await wallet.getAccounts();
    const client = await SigningCosmWasmClient.connectWithSigner(RPC, wallet);

    // Build token URI with metadata
    const metadataJson = JSON.stringify({
      name: metadata.title,
      description: metadata.description,
      attributes: [
        ...(metadata.class_id ? [{ trait_type: "class_id", value: metadata.class_id }] : []),
        ...(metadata.method ? [{ trait_type: "method", value: metadata.method }] : []),
        ...(metadata.difficulty ? [{ trait_type: "difficulty", value: metadata.difficulty }] : []),
        ...(metadata.duration_minutes != null
          ? [{ trait_type: "duration_minutes", value: String(metadata.duration_minutes) }]
          : []),
        ...(metadata.instructor_id
          ? [{ trait_type: "instructor_id", value: metadata.instructor_id }]
          : []),
      ],
    });
    const tokenUri = `data:application/json;base64,${Buffer.from(metadataJson).toString("base64")}`;

    // Execute all 3 steps atomically:
    // 1. Mint NFT (owner = deployer, so deployer can approve + list)
    // 2. Approve marketplace to transfer
    // 3. List on marketplace
    const fee = { amount: [{ denom: "uxion", amount: "1500" }], gas: "800000" };
    const result = await client.executeMultiple(
      account.address,
      [
        {
          contractAddress: NFT_CONTRACT,
          msg: {
            mint: {
              token_id: tokenId,
              owner: account.address,
              token_uri: tokenUri,
              extension: {},
            },
          },
        },
        {
          contractAddress: NFT_CONTRACT,
          msg: {
            approve: {
              spender: MARKETPLACE_CONTRACT,
              token_id: tokenId,
              expires: null,
            },
          },
        },
        {
          contractAddress: MARKETPLACE_CONTRACT,
          msg: {
            list_item: {
              collection: NFT_CONTRACT,
              token_id: tokenId,
              price: { denom: LISTING_DENOM, amount: priceAmount },
            },
          },
        },
      ],
      fee,
    );

    return NextResponse.json({
      tokenId,
      txHash: result.transactionHash,
    });
  } catch (err: any) {
    console.error("Mint+List error:", err);
    return NextResponse.json(
      { error: err.message ?? "Mint+List failed" },
      { status: 500 },
    );
  }
}
