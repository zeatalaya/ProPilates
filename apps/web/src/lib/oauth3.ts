/**
 * XION Abstraxion OAuth2 client.
 *
 * Handles user authentication and Meta Account (abstract account) creation
 * via the XION Abstraxion OAuth2 portal.
 *
 * ## Setup Prerequisites
 *
 * Before this works, you need:
 *
 * 1. **Deploy a Treasury contract** at https://dev.testnet.burnt.com
 *    - Configure Fee Grant: BasicAllowance with spend limit (e.g. 1000uxion)
 *    - Configure Authorization Grants:
 *      - MsgSend (for USDC transfers between users)
 *      - MsgExecuteContract for RECLAIM_CONTRACT (credential verification)
 *      - MsgExecuteContract for MARKETPLACE_CONTRACT (portfolio sales)
 *    - Set Redirect URI to: {APP_URL}/api/auth/oauth3/callback
 *    - Set Icon URL to your app logo
 *    - Fund the Treasury with XION tokens for gas coverage
 *
 * 2. **Register an OAuth2 client** at https://oauth2.testnet.burnt.com/
 *    - Select your Treasury contract address
 *    - Save the Client ID (and Client Secret if confidential)
 *
 * 3. **Set environment variables**:
 *    - NEXT_PUBLIC_OAUTH3_SERVER=https://oauth2.testnet.burnt.com
 *    - NEXT_PUBLIC_OAUTH3_CLIENT_ID=<your-client-id>
 *    - NEXT_PUBLIC_TREASURY_CONTRACT=<your-treasury-address>
 *
 * ## How It Works
 *
 * When a user authenticates via Abstraxion (Google, email, passkeys, or wallets),
 * a Meta Account (abstract account) is automatically created for them on XION.
 * The Treasury contract's grants determine what transactions your app can execute
 * on behalf of the user (gasless, via Fee Grants + Authz).
 *
 * After auth, call `getMetaAccount()` to get the user's XION address,
 * then use `xion-transactions.ts` to submit transactions.
 *
 * Docs: https://docs.burnt.com/xion/developers/getting-started-advanced/your-first-dapp/build-oauth2-app-with-xion-auth
 * Treasury: https://docs.burnt.com/xion/developers/getting-started-advanced/gasless-ux-and-permission-grants/treasury-contracts
 */

const OAUTH3_SERVER =
  process.env.NEXT_PUBLIC_OAUTH3_SERVER ?? "https://oauth2.testnet.burnt.com";
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

/**
 * Build the Abstraxion authorize URL.
 *
 * The `xion:transactions:submit` scope allows submitting transactions
 * through the Treasury contract's pre-approved grants (MsgSend,
 * MsgExecuteContract for specific contracts).
 *
 * The Abstraxion portal handles:
 * - User login (Google, email, passkeys, crypto wallets)
 * - Meta Account (abstract account) creation on XION
 * - Grant approval (user approves Treasury's permissions)
 */
export function getAuthorizeUrl(codeChallenge: string, state: string, provider?: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: OAUTH3_CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    scope: "openid profile email xion:transactions:submit",
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

/**
 * Fetch the authenticated user's Meta Account info from Abstraxion.
 *
 * Returns the user's XION address (Meta Account), which is the abstract
 * account created automatically when the user first authenticates.
 * This is the on-chain identity used for all transactions.
 */
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

/**
 * @deprecated Use getMetaAccount instead — this used an older endpoint
 */
export async function getUserInfo(accessToken: string) {
  return getMetaAccount(accessToken);
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
