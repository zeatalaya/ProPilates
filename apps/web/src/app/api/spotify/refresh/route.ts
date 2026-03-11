import { NextRequest, NextResponse } from "next/server";
import { createSpotifyClient } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 },
      );
    }

    const { refresh_token } = await request.json();
    if (!refresh_token) {
      return NextResponse.json(
        { error: "Missing refresh_token" },
        { status: 400 },
      );
    }

    const client = createSpotifyClient();
    client.setRefreshToken(refresh_token);
    const data = await client.refreshAccessToken();

    return NextResponse.json({
      access_token: data.body.access_token,
      expires_in: data.body.expires_in,
    });
  } catch (err: any) {
    // Distinguish between auth errors and server errors
    const statusCode = err?.statusCode;
    if (statusCode === 401 || statusCode === 400) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }
    console.error("[Spotify] Token refresh error:", err);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
