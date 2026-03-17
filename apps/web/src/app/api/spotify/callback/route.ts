import { NextRequest, NextResponse } from "next/server";
import { createSpotifyClient } from "@/lib/spotify";

// Allowed redirect paths to prevent open redirect
const ALLOWED_PATHS: Record<string, string> = {
  builder: "/builder",
  teach: "/teach",
  profile: "/profile",
  templates: "/templates",
  onboarding: "/onboarding",
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "builder";

  const isMobile = state === "mobile";

  if (!code) {
    if (isMobile) {
      return NextResponse.redirect(
        "propilates://spotify/callback?error=spotify_auth_failed",
      );
    }
    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url),
    );
  }

  try {
    const client = createSpotifyClient();
    const data = await client.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    // Mobile: deep-link back with tokens
    if (isMobile) {
      const params = new URLSearchParams({
        access_token,
        refresh_token,
        expires_in: String(expires_in),
      });
      return NextResponse.redirect(
        `propilates://spotify/callback?${params}`,
      );
    }

    // Only allow known redirect paths — prevent open redirect
    const redirectPath = ALLOWED_PATHS[state] ?? "/builder";

    if (state === "onboarding") {
      const redirectUrl = new URL("/onboarding", request.url);
      redirectUrl.searchParams.set("spotify_connected", "true");
      const response = NextResponse.redirect(redirectUrl);
      setSpotifyCookies(response, access_token, refresh_token, expires_in);
      return response;
    }

    // Store tokens in secure httpOnly cookies instead of URL hash
    const redirectUrl = new URL(
      `${redirectPath}?spotify_connected=true`,
      request.url,
    );
    const response = NextResponse.redirect(redirectUrl);
    setSpotifyCookies(response, access_token, refresh_token, expires_in);
    return response;
  } catch {
    if (isMobile) {
      return NextResponse.redirect(
        "propilates://spotify/callback?error=spotify_auth_failed",
      );
    }
    return NextResponse.redirect(
      new URL("/?error=spotify_auth_failed", request.url),
    );
  }
}

function setSpotifyCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = expiresIn || 3600;

  // Access token — expires with the token
  response.cookies.set("spotify_access_token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // Refresh token — long-lived
  response.cookies.set("spotify_refresh_token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Expires-in for client-side scheduling (not sensitive, not httpOnly)
  response.cookies.set("spotify_expires_in", String(expiresIn), {
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}
