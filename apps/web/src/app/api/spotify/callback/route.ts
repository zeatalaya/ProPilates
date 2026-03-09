import { NextRequest, NextResponse } from "next/server";
import { createSpotifyClient } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "builder";

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url),
    );
  }

  try {
    const client = createSpotifyClient();
    const data = await client.authorizationCodeGrant(code);

    const { access_token, refresh_token, expires_in } = data.body;

    // If user connected Spotify from onboarding, redirect back to onboarding
    if (state === "onboarding") {
      const redirectUrl = new URL("/onboarding", request.url);
      redirectUrl.searchParams.set("spotify_connected", "true");
      return NextResponse.redirect(redirectUrl);
    }

    // Default: redirect to builder with tokens as hash params
    const redirectUrl = new URL("/builder", request.url);
    redirectUrl.hash = `access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;

    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url),
    );
  }
}
