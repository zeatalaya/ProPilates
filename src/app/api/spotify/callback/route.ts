import { NextRequest, NextResponse } from "next/server";
import { createSpotifyClient } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url),
    );
  }

  try {
    const client = createSpotifyClient();
    const data = await client.authorizationCodeGrant(code);

    const { access_token, refresh_token, expires_in } = data.body;

    // Store tokens in a cookie / redirect with tokens as hash params
    const redirectUrl = new URL("/builder", request.url);
    redirectUrl.hash = `access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;

    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url),
    );
  }
}
