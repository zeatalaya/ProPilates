import { NextRequest, NextResponse } from "next/server";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

const RPC = process.env.NEXT_PUBLIC_XION_RPC ?? "https://rpc.xion-testnet-2.burnt.com:443";
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "";
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "";

/**
 * POST /api/nft/mint
 *
 * Server-side NFT minting using the deployer key.
 * The deployer is the CW721 minter, so only the server can mint.
 * The minted NFT is owned by the specified owner address.
 *
 * Body: { owner: string, tokenId: string, metadata: { title, description, ... } }
 * Returns: { tokenId, txHash }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, tokenId, metadata } = body;

    if (!owner || !tokenId || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields: owner, tokenId, metadata" },
        { status: 400 },
      );
    }

    if (!DEPLOYER_KEY || !NFT_CONTRACT) {
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

    // Mint NFT: deployer is minter, owner is the user
    const fee = { amount: [{ denom: "uxion", amount: "500" }], gas: "300000" };
    const result = await client.execute(
      account.address,
      NFT_CONTRACT,
      {
        mint: {
          token_id: tokenId,
          owner,
          token_uri: tokenUri,
          extension: {},
        },
      },
      fee,
    );

    return NextResponse.json({
      tokenId,
      txHash: result.transactionHash,
    });
  } catch (err: any) {
    console.error("Mint error:", err);
    return NextResponse.json(
      { error: err.message ?? "Mint failed" },
      { status: 500 },
    );
  }
}
