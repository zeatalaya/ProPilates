"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import {
  isOAuth3Configured,
  generatePKCE,
  getAuthorizeUrl,
  exchangeCodeForTokens,
  getUserInfo,
} from "@/lib/oauth3";

const SESSION_KEY = "propilates_oauth3_session";
const PKCE_KEY = "propilates_pkce_verifier";
const STATE_KEY = "propilates_oauth_state";

interface OAuth3Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    id: string;
    email?: string;
    name?: string;
    xionAddress?: string;
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
      // Code exchange flow — server returned the code for client-side exchange
      const codeData = params.get("code_data");
      if (codeData) {
        handleCodeExchange(codeData);
      }
    }
  }, [isInitialized, setXionAddress, setConnected, setOAuthAccessToken]);

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

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, verifier);

      // Fetch user info with the access token
      const userInfo = await getUserInfo(tokens.access_token);

      const newSession: OAuth3Session = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          xionAddress: userInfo.xion_address,
        },
      };

      setSession(newSession);
      setOAuthAccessToken(tokens.access_token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

      if (userInfo.xion_address) {
        setXionAddress(userInfo.xion_address);
      }
      setConnected(true);

      // Clean up
      sessionStorage.removeItem(PKCE_KEY);
      sessionStorage.removeItem(STATE_KEY);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err) {
      console.error("Code exchange failed:", err);
    }
  }

  const login = useCallback(
    async (provider: string = "google") => {
      if (!isOAuth3Configured) {
        // Demo mode: simulate login with XION account creation
        const demoSession: OAuth3Session = {
          accessToken: "demo-token",
          expiresAt: Date.now() + 86400000,
          user: {
            id: "demo-user",
            email: "demo@propilates.app",
            name: "Demo Instructor",
            xionAddress: "xion1demo" + Math.random().toString(36).slice(2, 12),
          },
        };
        setSession(demoSession);
        setOAuthAccessToken(demoSession.accessToken);
        localStorage.setItem(SESSION_KEY, JSON.stringify(demoSession));
        setXionAddress(demoSession.user.xionAddress!);
        setConnected(true);
        return;
      }

      // Generate PKCE + state
      const { verifier, challenge } = await generatePKCE();
      const state = crypto.randomUUID();
      sessionStorage.setItem(PKCE_KEY, verifier);
      sessionStorage.setItem(STATE_KEY, state);

      // Redirect to Abstraxion OAuth2 portal
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
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
  };
}
