import { NextRequest, NextResponse } from "next/server";
import { createSpotifyClient } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  try {
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
  } catch (err) {
    console.error("[Spotify] Token refresh error:", err);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
