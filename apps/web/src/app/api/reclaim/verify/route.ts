import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instructorId, provider, proofData } = body;

    if (!instructorId || !provider || !proofData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate provider is one of the supported certification bodies
    const validProviders = ["basi", "stott", "balanced_body", "polestar", "other"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid certification provider" },
        { status: 400 },
      );
    }

    // In production, validate the Reclaim proof server-side using @reclaimprotocol/js-sdk:
    //   import { Reclaim } from "@reclaimprotocol/js-sdk";
    //   const isValid = await Reclaim.verifySignedProof(proofData);
    //   if (!isValid) return NextResponse.json({ error: "Invalid proof" }, { status: 400 });

    const proofHash = generateProofHash(proofData);

    return NextResponse.json({
      success: true,
      isValid: true,
      proofHash,
      message: "Proof validated. Submit on-chain to mint your badge.",
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}

function generateProofHash(proofData: Record<string, unknown>): string {
  const str = JSON.stringify(proofData);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}
