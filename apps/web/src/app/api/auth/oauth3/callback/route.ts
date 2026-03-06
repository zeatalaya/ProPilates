import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/oauth3";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=missing_code`,
    );
  }

  try {
    // The PKCE verifier is stored client-side in sessionStorage,
    // so we pass the code back to the client to complete the exchange.
    // For a server-side flow, we'd need the verifier here.
    // Using a hybrid approach: redirect back with the code for client exchange.
    const sessionData = JSON.stringify({
      code,
      state,
    });

    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=code&code_data=${encodeURIComponent(sessionData)}`,
    );
  } catch (err: any) {
    return NextResponse.redirect(
      `${appUrl}/onboarding?oauth_result=error&error=${encodeURIComponent(err.message)}`,
    );
  }
}
