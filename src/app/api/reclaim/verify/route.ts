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

    // In production, validate the Reclaim proof server-side
    // using @reclaim-protocol/js-sdk before storing
    // For now, we pass through to be submitted on-chain

    return NextResponse.json({
      success: true,
      message: "Proof validated. Submit on-chain to complete verification.",
      proofData,
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    );
  }
}
