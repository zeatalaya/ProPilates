import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    // Sanitize error to prevent injection — only allow alphanumeric, underscore, space
    const safeError = error.replace(/[^a-zA-Z0-9_ ]/g, "").slice(0, 100);
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=${encodeURIComponent(safeError)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=missing_code`,
    );
  }

  // The PKCE verifier is stored client-side in sessionStorage,
  // so we pass the code back to the client to complete the exchange.
  const sessionData = JSON.stringify({ code, state });

  return NextResponse.redirect(
    `${appUrl}/onboarding?oauth_result=code&code_data=${encodeURIComponent(sessionData)}`,
  );
}
