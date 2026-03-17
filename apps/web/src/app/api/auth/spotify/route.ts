import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/lib/spotify";

// Whitelist of allowed redirect origins to prevent open redirect
const ALLOWED_FROM = new Set([
  "builder",
  "teach",
  "profile",
  "templates",
  "onboarding",
  "mobile",
]);

export async function GET(request: NextRequest) {
  const rawFrom = request.nextUrl.searchParams.get("from") || "builder";
  // Only allow known origins — reject anything else to prevent open redirect
  const from = ALLOWED_FROM.has(rawFrom) ? rawFrom : "builder";
  const url = getSpotifyAuthUrl(from);
  return NextResponse.redirect(url);
}
