"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import {
  isOAuth3Configured,
  generatePKCE,
  getAuthorizeUrl,
  exchangeCodeForTokens,
  getMetaAccount,
} from "@/lib/oauth3";

const SESSION_KEY = "propilates_oauth3_session";
const PKCE_KEY = "propilates_pkce_verifier";
const STATE_KEY = "propilates_oauth_state";

/** Module-level lock to prevent multiple hook instances from exchanging the same code */
let codeExchangeInProgress = false;

interface OAuth3Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    /** XION Meta Account address (e.g. xion1abc...) — the user's on-chain identity */
    xionAddress: string;
  };
}

export function useOAuth3() {
  const { setXionAddress, setConnected, setLoading, setOAuthAccessToken } =
    useAuthStore();
  const [session, setSession] = useState<OAuth3Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: OAuth3Session = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
          setOAuthAccessToken(parsed.accessToken);
          if (parsed.user.xionAddress) {
            setXionAddress(parsed.user.xionAddress);
          }
          setConnected(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
    setIsInitialized(true);
  }, [setXionAddress, setConnected, setLoading, setOAuthAccessToken]);

  // Auto-restore instructor profile from Supabase when xionAddress is available
  useEffect(() => {
    const { instructor, setInstructor, setTier } = useAuthStore.getState();
    const xionAddr = session?.user?.xionAddress;
    if (!xionAddr || instructor) return;

    async function restoreProfile() {
      try {
        const { data } = await supabase
          .from("instructors")
          .select("*")
          .eq("xion_address", xionAddr)
          .maybeSingle();
        if (data) {
          setInstructor(data);
          // Also restore subscription tier
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("tier")
            .eq("instructor_id", data.id)
            .eq("status", "active")
            .maybeSingle();
          if (sub?.tier) setTier(sub.tier);
        }
      } catch (err) {
        console.error("Failed to restore instructor profile:", err);
      }
    }
    restoreProfile();
  }, [session]);

  // Handle OAuth callback result — supports both direct session data and code exchange
  useEffect(() => {
    if (!isInitialized) return;
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get("oauth_result");

    if (oauthResult === "success") {
      // Direct session data (pre-exchanged by server)
      const sessionData = params.get("session_data");
      if (sessionData) {
        try {
          const parsed: OAuth3Session = JSON.parse(
            decodeURIComponent(sessionData),
          );
          setSession(parsed);
          setOAuthAccessToken(parsed.accessToken);
          localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
          if (parsed.user.xionAddress) {
            setXionAddress(parsed.user.xionAddress);
          }
          setConnected(true);
          window.history.replaceState({}, "", window.location.pathname);
        } catch {
          console.error("Failed to parse OAuth session data");
        }
      }
    } else if (oauthResult === "code") {
      // Code exchange flow — server returned the code for client-side PKCE exchange
      // Guard: multiple useOAuth3 instances (Navbar + page) may both detect the code
      const codeData = params.get("code_data");
      if (codeData && !codeExchangeInProgress) {
        codeExchangeInProgress = true;
        handleCodeExchange(codeData);
      }
    }
  }, [isInitialized, setXionAddress, setConnected, setOAuthAccessToken]);

  /**
   * Complete the OAuth2 PKCE code exchange flow:
   *
   * 1. Validate state (CSRF protection)
   * 2. Exchange authorization code for access token (PKCE)
   * 3. Call GET /api/v1/me on Abstraxion to get the user's Meta Account
   *    → This returns the user's XION address (abstract account)
   *    → The Meta Account is created automatically on first login
   * 4. Store session with XION address for on-chain operations
   *
   * After this, the access token can be used with xion-transactions.ts
   * to submit transactions (gasless, via Treasury contract grants).
   */
  async function handleCodeExchange(codeDataStr: string) {
    try {
      const { code, state } = JSON.parse(decodeURIComponent(codeDataStr));
      const storedState = sessionStorage.getItem(STATE_KEY);
      const verifier = sessionStorage.getItem(PKCE_KEY);

      if (state !== storedState) {
        console.error("OAuth state mismatch");
        return;
      }

      if (!verifier) {
        console.error("PKCE verifier not found");
        return;
      }

      // Step 1: Exchange authorization code for tokens
      const tokens = await exchangeCodeForTokens(code, verifier);

      // Step 2: Fetch user's Meta Account (abstract account) from Abstraxion
      // GET /api/v1/me returns { id: "xion1abc..." }
      // The Meta Account is created automatically when the user first authenticates
      const metaAccount = await getMetaAccount(tokens.access_token);

      const newSession: OAuth3Session = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        user: {
          xionAddress: metaAccount.id, // The XION address (e.g. xion1abc...)
        },
      };

      setSession(newSession);
      setOAuthAccessToken(tokens.access_token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setXionAddress(metaAccount.id);
      setConnected(true);

      // Clean up PKCE state
      sessionStorage.removeItem(PKCE_KEY);
      sessionStorage.removeItem(STATE_KEY);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err) {
      console.error("Code exchange failed:", err);
    } finally {
      codeExchangeInProgress = false;
    }
  }

  const login = useCallback(
    async (provider: string = "google") => {
      if (!isOAuth3Configured) {
        // Demo mode: simulate Abstraxion login + Meta Account creation
        const demoAddress =
          "xion1demo" + Math.random().toString(36).slice(2, 12);
        const demoSession: OAuth3Session = {
          accessToken: "demo-token",
          expiresAt: Date.now() + 86400000,
          user: {
            xionAddress: demoAddress,
          },
        };
        setSession(demoSession);
        setOAuthAccessToken(demoSession.accessToken);
        localStorage.setItem(SESSION_KEY, JSON.stringify(demoSession));
        setXionAddress(demoAddress);
        setConnected(true);
        return;
      }

      // Generate PKCE challenge + state for CSRF protection
      const { verifier, challenge } = await generatePKCE();
      const state = crypto.randomUUID();
      sessionStorage.setItem(PKCE_KEY, verifier);
      sessionStorage.setItem(STATE_KEY, state);

      // Redirect to Abstraxion OAuth2 portal
      // The portal handles:
      //   1. User login (Google, email, passkeys, crypto wallets)
      //   2. Meta Account creation on XION (first time only)
      //   3. Treasury grant approval (user approves the app's permissions)
      window.location.href = getAuthorizeUrl(challenge, state, provider);
    },
    [setXionAddress, setConnected, setOAuthAccessToken],
  );

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PKCE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    setOAuthAccessToken(null);
    setXionAddress(null);
    setConnected(false);
    useAuthStore.getState().reset();
  }, [setXionAddress, setConnected, setOAuthAccessToken]);

  return {
    session,
    isAuthenticated: !!session,
    isOAuth3Configured,
    login,
    logout,
    /** User's XION Meta Account address */
    xionAddress: session?.user?.xionAddress ?? null,
    /** OAuth2 access token for submitting transactions via Abstraxion */
    accessToken: session?.accessToken ?? null,
  };
}
