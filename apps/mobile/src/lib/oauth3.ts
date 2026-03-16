/**
 * XION Abstraxion OAuth2 PKCE client for React Native / Expo.
 *
 * Uses the web's registered callback URL as the OAuth redirect URI.
 * The web callback route detects mobile requests (via "mobile:" state prefix)
 * and redirects back to the app via propilates:// deep link.
 *
 * Flow: Mobile → OAuth Server → Web Callback → propilates://auth/callback
 */

import * as Crypto from "expo-crypto";
import { ENV } from "./config";

const OAUTH3_SERVER = ENV.OAUTH3_SERVER;
const OAUTH3_CLIENT_ID = ENV.OAUTH3_CLIENT_ID;

export const isOAuth3Configured = !!(OAUTH3_SERVER && OAUTH3_CLIENT_ID);

// The redirect URI must match what's registered with the OAuth2 server.
// We use the web callback URL which then deep-links back to the mobile app.
const WEB_CALLBACK_URL = "https://pro-pilates.vercel.app/api/auth/oauth3/callback";

// Deep link URI that the web callback redirects to
export const MOBILE_DEEP_LINK = "propilates://auth/callback";

// ── PKCE helpers ──

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generatePKCE() {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const verifier = base64UrlEncode(new Uint8Array(randomBytes));
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  // Convert standard base64 to base64url
  const challenge = digest
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return { verifier, challenge };
}

// ── Auth flow ──

/**
 * Build the authorize URL.
 * State is prefixed with "mobile:" so the web callback knows to redirect
 * back to the mobile app via deep link.
 */
export function getAuthorizeUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH3_CLIENT_ID,
    redirect_uri: WEB_CALLBACK_URL,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state: `mobile:${state}`,
    scope: "openid profile email xion:transactions:submit",
  });
  return `${OAUTH3_SERVER}/oauth/authorize?${params}`;
}

/**
 * Exchange authorization code for tokens.
 * Uses the web callback URL as redirect_uri (must match what was sent to /authorize).
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
) {
  const res = await fetch(`${OAUTH3_SERVER}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: WEB_CALLBACK_URL,
      client_id: OAUTH3_CLIENT_ID,
      code_verifier: codeVerifier,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status})`);
  }
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
  }>;
}

export async function getMetaAccount(accessToken: string) {
  const res = await fetch(`${OAUTH3_SERVER}/api/v1/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Meta Account info");
  return res.json() as Promise<{
    id: string; // XION address (e.g. xion1abc...)
    authenticators?: Array<{ type: string; id: string }>;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${OAUTH3_SERVER}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: OAUTH3_CLIENT_ID,
    }).toString(),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  return res.json();
}
