import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Check if this is a mobile OAuth callback (state starts with "mobile:")
  const isMobile = state?.startsWith("mobile:") ?? false;
  const actualState = isMobile ? state!.slice(7) : state;

  if (error) {
    const safeError = error.replace(/[^a-zA-Z0-9_ ]/g, "").slice(0, 100);
    if (isMobile) {
      return NextResponse.redirect(
        `propilates://auth/callback?error=${encodeURIComponent(safeError)}`,
      );
    }
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=${encodeURIComponent(safeError)}`,
    );
  }

  if (!code) {
    if (isMobile) {
      return NextResponse.redirect(
        `propilates://auth/callback?error=missing_code`,
      );
    }
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=missing_code`,
    );
  }

  // Route grant-setup flow to the treasury setup endpoint
  if (actualState === "grant-setup") {
    return NextResponse.redirect(
      `${appUrl}/api/treasury/setup-grants?code=${encodeURIComponent(code)}`,
    );
  }

  if (isMobile) {
    // Redirect back to mobile app with code and state via deep link
    return NextResponse.redirect(
      `propilates://auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(actualState ?? "")}`,
    );
  }

  // Web: pass the code back to the client to complete the PKCE exchange
  const sessionData = JSON.stringify({ code, state });

  return NextResponse.redirect(
    `${appUrl}/onboarding?oauth_result=code&code_data=${encodeURIComponent(sessionData)}`,
  );
}
