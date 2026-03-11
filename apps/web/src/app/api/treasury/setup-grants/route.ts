import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const OAUTH_SERVER =
  process.env.NEXT_PUBLIC_OAUTH3_SERVER ?? "https://oauth2.testnet.burnt.com";
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH3_CLIENT_ID ?? "";
const TREASURY = process.env.NEXT_PUBLIC_TREASURY_CONTRACT ?? "";
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT ?? "";
const MARKETPLACE_CONTRACT = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/auth/oauth3/callback`;

// ── Protobuf encoding ──

function encodeVarint(v: number): Uint8Array {
  const b: number[] = [];
  while (v > 0x7f) { b.push((v & 0x7f) | 0x80); v >>>= 7; }
  b.push(v & 0x7f);
  return new Uint8Array(b);
}

function concat(arrs: Uint8Array[]): Uint8Array {
  const len = arrs.reduce((s, a) => s + a.length, 0);
  const r = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) { r.set(a, o); o += a.length; }
  return r;
}

function encodeField(num: number, wire: number, data: Uint8Array): Uint8Array {
  const tag = encodeVarint((num << 3) | wire);
  if (wire === 2) return concat([tag, encodeVarint(data.length), data]);
  return concat([tag, data]);
}

function buildContractExecutionAuth(contracts: string[]): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  for (const contract of contracts) {
    const grant = concat([
      encodeField(1, 2, enc.encode(contract)),
      encodeField(2, 2, concat([
        encodeField(1, 2, enc.encode("/cosmwasm.wasm.v1.MaxCallsLimit")),
        encodeField(2, 2, new Uint8Array([0x08, 0xff, 0x01])),
      ])),
      encodeField(3, 2, concat([
        encodeField(1, 2, enc.encode("/cosmwasm.wasm.v1.AllowAllMessagesFilter")),
      ])),
    ]);
    parts.push(encodeField(1, 2, grant));
  }
  return concat(parts);
}

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

function htmlPage(title: string, body: string): NextResponse {
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
<style>body{font-family:system-ui;max-width:650px;margin:40px auto;padding:0 20px;background:#0a0a0a;color:#e0e0e0}
h1{color:#a78bfa}a,button{background:#7c3aed;color:#fff;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:16px;text-decoration:none;display:inline-block}
a:hover,button:hover{background:#6d28d9}.ok{color:#34d399}.err{color:#f87171}
pre{background:#111;padding:12px;border-radius:6px;overflow-x:auto;font-size:13px;white-space:pre-wrap}
code{color:#93c5fd}.box{background:#1a1a2e;border:1px solid #333;border-radius:8px;padding:16px;margin:16px 0}</style>
</head><body>${body}</body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return htmlPage("Grant Setup - Error", `
      <h1>Grant Setup Failed</h1>
      <div class="box"><span class="err">OAuth error: ${error.replace(/[^a-zA-Z0-9_ ]/g, "")}</span></div>
      <a href="/api/treasury/setup-grants">Try Again</a>
    `);
  }

  if (code) {
    const verifier = request.cookies.get("pkce_verifier")?.value;
    if (!verifier) {
      return htmlPage("Grant Setup - Error", `
        <h1>Session Expired</h1>
        <div class="box"><span class="err">PKCE verifier not found.</span></div>
        <a href="/api/treasury/setup-grants">Start Over</a>
      `);
    }

    let accessToken: string;
    try {
      const tokenRes = await fetch(`${OAUTH_SERVER}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: verifier,
        }),
      });
      if (!tokenRes.ok) {
        const text = await tokenRes.text();
        return htmlPage("Grant Setup - Error", `
          <h1>Token Exchange Failed</h1>
          <div class="box"><span class="err">Status ${tokenRes.status}</span><pre>${text}</pre></div>
          <a href="/api/treasury/setup-grants">Try Again</a>
        `);
      }
      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
    } catch (err: any) {
      return htmlPage("Grant Setup - Error", `
        <h1>Token Exchange Error</h1>
        <div class="box"><span class="err">${err.message}</span></div>
        <a href="/api/treasury/setup-grants">Try Again</a>
      `);
    }

    const authBytes = buildContractExecutionAuth([
      NFT_CONTRACT,
      MARKETPLACE_CONTRACT,
    ]);
    const authBase64 = Buffer.from(authBytes).toString("base64");

    const executeMsg = {
      update_grant_config: {
        msg_type_url: "/cosmwasm.wasm.v1.MsgExecuteContract",
        grant_config: {
          description: "ProPilates NFT and Marketplace contract execution grants",
          authorization: {
            type_url: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
            value: authBase64,
          },
          optional: false,
        },
      },
    };

    const cosmosMsg = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: {
        sender: "",
        contract: TREASURY,
        msg: Buffer.from(JSON.stringify(executeMsg)).toString("base64"),
        funds: [],
      },
    };

    try {
      const txRes = await fetch(`${OAUTH_SERVER}/api/v1/transaction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [cosmosMsg] }),
      });

      const txText = await txRes.text();
      let txResult;
      try { txResult = JSON.parse(txText); } catch { txResult = { raw: txText }; }

      if (!txRes.ok) {
        const res = htmlPage("Grant Setup - Failed", `
          <h1>Transaction Failed</h1>
          <div class="box">
            <p><span class="err">Status ${txRes.status}</span></p>
            <pre>${JSON.stringify(txResult, null, 2)}</pre>
          </div>
          <a href="/api/treasury/setup-grants">Try Again</a>
        `);
        res.cookies.delete("pkce_verifier");
        return res;
      }

      const res = htmlPage("Grant Setup - Success!", `
        <h1 class="ok">Grants Configured Successfully!</h1>
        <div class="box">
          <p>TX Hash: <code>${txResult.transactionHash ?? "N/A"}</code></p>
          <p>Contracts authorized:</p>
          <ul>
            <li>NFT: <code>${NFT_CONTRACT}</code></li>
            <li>Marketplace: <code>${MARKETPLACE_CONTRACT}</code></li>
          </ul>
        </div>
        <pre>${JSON.stringify(txResult, null, 2)}</pre>
      `);
      res.cookies.delete("pkce_verifier");
      return res;
    } catch (err: any) {
      return htmlPage("Grant Setup - Error", `
        <h1>Transaction Error</h1>
        <div class="box"><span class="err">${err.message}</span></div>
        <a href="/api/treasury/setup-grants">Try Again</a>
      `);
    }
  }

  if (action === "start") {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid xion:transactions:submit",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: "grant-setup",
    });

    const res = NextResponse.redirect(`${OAUTH_SERVER}/authorize?${params}`);
    res.cookies.set("pkce_verifier", verifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });
    return res;
  }

  return htmlPage("ProPilates - Treasury Grant Setup", `
    <h1>Treasury Grant Setup</h1>
    <p>This will configure the correct MsgExecuteContract grants (without spaces).</p>
    <div class="box">
      <h3 style="margin-top:0;color:#c4b5fd">Contracts to authorize:</h3>
      <ul>
        <li><strong>NFT</strong>: <code>${NFT_CONTRACT}</code></li>
        <li><strong>Marketplace</strong>: <code>${MARKETPLACE_CONTRACT}</code></li>
      </ul>
      <p style="color:#999">Treasury: <code>${TREASURY}</code></p>
    </div>
    <div class="box">
      <a href="/api/treasury/setup-grants?action=start">Sign in & Configure Grants</a>
    </div>
  `);
}
