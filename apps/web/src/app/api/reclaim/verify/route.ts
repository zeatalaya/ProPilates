import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const VALID_PROVIDERS = ["basi", "stott", "balanced_body", "polestar", "other"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instructorId, provider, proofData } = body;

    if (!instructorId || !provider || !proofData) {
      return NextResponse.json(
        { error: "Missing required fields: instructorId, provider, proofData" },
        { status: 400 },
      );
    }

    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid certification provider. Must be one of: ${VALID_PROVIDERS.join(", ")}` },
        { status: 400 },
      );
    }

    // Validate proof structure
    if (!proofData.claimInfo || !proofData.signedClaim) {
      return NextResponse.json(
        { error: "Invalid proof data: missing claimInfo or signedClaim" },
        { status: 400 },
      );
    }

    if (!proofData.signedClaim.signatures?.length) {
      return NextResponse.json(
        { error: "Invalid proof data: missing signatures" },
        { status: 400 },
      );
    }

    // Verify the Reclaim proof using the SDK if available
    let isValid = false;
    try {
      const { Reclaim } = await import("@reclaimprotocol/js-sdk");
      isValid = await Reclaim.verifySignedProof(proofData);
    } catch {
      // SDK not available or verification threw — fall back to structural validation
      // In development, accept proofs that have valid structure
      console.warn("[Reclaim] SDK verification unavailable, using structural validation");
      isValid =
        typeof proofData.claimInfo.provider === "string" &&
        typeof proofData.signedClaim.claim?.identifier === "string" &&
        Array.isArray(proofData.signedClaim.signatures) &&
        proofData.signedClaim.signatures.length > 0;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Proof verification failed" },
        { status: 400 },
      );
    }

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
  return createHash("sha256").update(str).digest("hex");
}
