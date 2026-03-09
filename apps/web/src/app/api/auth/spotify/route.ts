import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") || "builder";
  const url = getSpotifyAuthUrl(from);
  return NextResponse.redirect(url);
}
