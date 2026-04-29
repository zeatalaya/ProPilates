import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// POST: Create a Stripe Connect account for a seller
export async function POST(request: NextRequest) {
  try {
    const { instructorId, email } = await request.json();

    if (!instructorId) {
      return NextResponse.json({ error: "Missing instructorId" }, { status: 400 });
    }

    // Create a Connect Express account
    const account = await getStripe().accounts.create({
      type: "express",
      email: email || undefined,
      metadata: { instructorId },
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Create an onboarding link
    const origin = request.headers.get("origin") || "https://thepropilates.com";
    const accountLink = await getStripe().accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/profile?stripe_refresh=true`,
      return_url: `${origin}/profile?stripe_connected=true&account_id=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error("[Stripe Connect] Error:", error);
    return NextResponse.json({ error: "Failed to create Connect account" }, { status: 500 });
  }
}

// GET: Create a login link for existing Connect account
export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get("account_id");

  if (!accountId) {
    return NextResponse.json({ error: "Missing account_id" }, { status: 400 });
  }

  try {
    const loginLink = await getStripe().accounts.createLoginLink(accountId);
    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error("[Stripe Connect] Login link error:", error);
    return NextResponse.json({ error: "Failed to create login link" }, { status: 500 });
  }
}
