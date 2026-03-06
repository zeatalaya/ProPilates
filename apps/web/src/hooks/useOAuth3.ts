"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { isOAuth3Configured, generatePKCE, getAuthorizeUrl } from "@/lib/oauth3";

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
  const { setXionAddress, setConnected, setLoading } = useAuthStore();
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
  }, [setXionAddress, setConnected, setLoading]);

  // Handle OAuth callback result
  useEffect(() => {
    if (!isInitialized) return;
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get("oauth_result");
    if (oauthResult === "success") {
      const sessionData = params.get("session_data");
      if (sessionData) {
        try {
          const parsed: OAuth3Session = JSON.parse(
            decodeURIComponent(sessionData),
          );
          setSession(parsed);
          localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
          if (parsed.user.xionAddress) {
            setXionAddress(parsed.user.xionAddress);
          }
          setConnected(true);
          // Clean URL
          window.history.replaceState({}, "", window.location.pathname);
        } catch {
          console.error("Failed to parse OAuth session data");
        }
      }
    }
  }, [isInitialized, setXionAddress, setConnected]);

  const login = useCallback(
    async (provider: string = "google") => {
      if (!isOAuth3Configured) {
        // Demo mode: simulate login
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

      // Redirect to OAuth3 server
      window.location.href = getAuthorizeUrl(challenge, state, provider);
    },
    [setXionAddress, setConnected],
  );

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    setXionAddress(null);
    setConnected(false);
    useAuthStore.getState().reset();
  }, [setXionAddress, setConnected]);

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
