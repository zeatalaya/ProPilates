/**
 * OAuth3 client for XION authentication.
 * Integrates with burnt-labs/oauth3 backend service.
 * Provides standard OAuth 2.1 PKCE flow for social login.
 */

const OAUTH3_SERVER = process.env.NEXT_PUBLIC_OAUTH3_SERVER ?? "";
const OAUTH3_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH3_CLIENT_ID ?? "";
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/oauth3/callback`;

export const isOAuth3Configured = !!(OAUTH3_SERVER && OAUTH3_CLIENT_ID);

// ── PKCE helpers ──

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plain));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generatePKCE() {
  const verifier = generateRandomString(32);
  const challenge = base64UrlEncode(await sha256(verifier));
  return { verifier, challenge };
}

// ── Auth flow ──

export function getAuthorizeUrl(codeChallenge: string, state: string, provider?: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH3_CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });
  if (provider) params.set("provider", provider);
  return `${OAUTH3_SERVER}/oauth/authorize?${params}`;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const res = await fetch(`${OAUTH3_SERVER}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: CALLBACK_URL,
      client_id: OAUTH3_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) throw new Error("Token exchange failed");
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
  }>;
}

export async function getUserInfo(accessToken: string) {
  const res = await fetch(`${OAUTH3_SERVER}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user info");
  return res.json() as Promise<{
    id: string;
    email?: string;
    name?: string;
    xion_address?: string;
    providers: Array<{ provider: string; email?: string }>;
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
    }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  return res.json();
}

export function getLoginUrl(provider: string = "google"): string {
  return `${OAUTH3_SERVER}/auth/${provider}`;
}

export function getLogoutUrl(): string {
  return `${OAUTH3_SERVER}/logout`;
}

// ── Proxy helper (calls provider APIs through OAuth3 TEE) ──

export async function proxyRequest(
  accessToken: string,
  provider: string,
  path: string,
) {
  const res = await fetch(`${OAUTH3_SERVER}/proxy/${provider}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Proxy request failed: ${res.status}`);
  return res.json();
}

// ── TEE Attestation ──

export async function getAttestation() {
  const res = await fetch(`${OAUTH3_SERVER}/attestation`);
  if (!res.ok) throw new Error("Attestation fetch failed");
  return res.json();
}

export async function verifyGmail(accessToken: string) {
  const res = await fetch(`${OAUTH3_SERVER}/verify/gmail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Gmail verification failed");
  return res.json();
}
