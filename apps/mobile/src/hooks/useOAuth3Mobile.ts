/**
 * Mobile OAuth2 PKCE hook for XION Abstraxion authentication.
 *
 * Flow:
 * 1. User taps "Log In" → opens Abstraxion portal in browser
 * 2. User authenticates (Google, email, passkey)
 * 3. OAuth server redirects to web callback (registered redirect URI)
 * 4. Web callback detects "mobile:" state prefix, redirects to propilates://auth/callback
 * 5. expo-web-browser intercepts the deep link
 * 6. Hook exchanges code for tokens (PKCE)
 * 7. Fetches Meta Account (XION address) from /api/v1/me
 * 8. Restores instructor profile + subscription from Supabase
 * 9. Persists session to SecureStore
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@propilates/shared";
import { supabase } from "../lib/supabase";
import {
  isOAuth3Configured,
  generatePKCE,
  getAuthorizeUrl,
  exchangeCodeForTokens,
  getMetaAccount,
  MOBILE_DEEP_LINK,
} from "../lib/oauth3";

// Ensure browser auth session completes properly
WebBrowser.maybeCompleteAuthSession();

const SESSION_KEY = "propilates_oauth3_session";

interface OAuth3Session {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: {
    xionAddress: string;
  };
}

export function useOAuth3Mobile() {
  const {
    setXionAddress,
    setConnected,
    setLoading,
    setOAuthAccessToken,
    setInstructor,
    setTier,
    instructor,
  } = useAuthStore();
  const [session, setSession] = useState<OAuth3Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const restoredRef = useRef(false);

  // Restore session from SecureStore on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const stored =
          Platform.OS === "web"
            ? localStorage.getItem(SESSION_KEY)
            : await SecureStore.getItemAsync(SESSION_KEY);

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
            if (Platform.OS === "web") {
              localStorage.removeItem(SESSION_KEY);
            } else {
              await SecureStore.deleteItemAsync(SESSION_KEY);
            }
          }
        }
      } catch {
        try {
          if (Platform.OS === "web") {
            localStorage.removeItem(SESSION_KEY);
          } else {
            await SecureStore.deleteItemAsync(SESSION_KEY);
          }
        } catch {}
      }
      setLoading(false);
      setIsInitialized(true);
    }
    restoreSession();
  }, [setXionAddress, setConnected, setLoading, setOAuthAccessToken]);

  // Auto-restore instructor profile from Supabase when session available
  useEffect(() => {
    const xionAddr = session?.user?.xionAddress;
    if (!xionAddr || instructor || restoredRef.current) return;
    restoredRef.current = true;

    async function restoreProfile() {
      try {
        const { data } = await supabase
          .from("instructors")
          .select("*")
          .eq("xion_address", xionAddr)
          .maybeSingle();
        if (data) {
          setInstructor(data);
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
  }, [session, instructor, setInstructor, setTier]);

  async function persistSession(newSession: OAuth3Session) {
    const json = JSON.stringify(newSession);
    if (Platform.OS === "web") {
      localStorage.setItem(SESSION_KEY, json);
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, json);
    }
  }

  const login = useCallback(async () => {
    if (isAuthenticating) return;

    if (!isOAuth3Configured) {
      // Demo mode
      const demoAddress = "xion1demo" + Date.now().toString(36);
      const demoSession: OAuth3Session = {
        accessToken: "demo-token",
        expiresAt: Date.now() + 86400000,
        user: { xionAddress: demoAddress },
      };
      setSession(demoSession);
      setOAuthAccessToken(demoSession.accessToken);
      await persistSession(demoSession);
      setXionAddress(demoAddress);
      setConnected(true);
      return;
    }

    setIsAuthenticating(true);
    try {
      // Step 1: Generate PKCE
      const { verifier, challenge } = await generatePKCE();
      const state = Math.random().toString(36).slice(2) + Date.now().toString(36);

      // Step 2: Build authorize URL (state prefixed with "mobile:" for web callback routing)
      const authorizeUrl = getAuthorizeUrl(challenge, state);

      // Step 3: Open browser for OAuth
      // The OAuth server redirects to the web callback URL (registered redirect URI).
      // The web callback detects "mobile:" in state and redirects to propilates://auth/callback.
      // expo-web-browser intercepts the deep link and returns the result.
      const result = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        MOBILE_DEEP_LINK,
      );

      if (result.type !== "success" || !result.url) {
        return; // User cancelled or error
      }

      // Step 4: Parse the deep link URL for code and state
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error("No authorization code in callback");
      }

      if (returnedState !== state) {
        throw new Error("OAuth state mismatch — possible CSRF");
      }

      // Step 5: Exchange code for tokens (uses web callback URL as redirect_uri)
      const tokens = await exchangeCodeForTokens(code, verifier);

      // Step 6: Fetch Meta Account (XION address)
      const metaAccount = await getMetaAccount(tokens.access_token);

      // Step 7: Create and persist session
      const newSession: OAuth3Session = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        user: { xionAddress: metaAccount.id },
      };

      setSession(newSession);
      setOAuthAccessToken(tokens.access_token);
      await persistSession(newSession);
      setXionAddress(metaAccount.id);
      setConnected(true);
    } catch (err) {
      console.error("OAuth login failed:", err);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    isAuthenticating,
    setXionAddress,
    setConnected,
    setOAuthAccessToken,
  ]);

  const logout = useCallback(async () => {
    setSession(null);
    restoredRef.current = false;
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(SESSION_KEY);
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    } catch {}
    setOAuthAccessToken(null);
    setXionAddress(null);
    setConnected(false);
    useAuthStore.getState().reset();
  }, [setXionAddress, setConnected, setOAuthAccessToken]);

  return {
    session,
    isAuthenticated: !!session,
    isOAuth3Configured,
    isInitialized,
    isAuthenticating,
    login,
    logout,
    xionAddress: session?.user?.xionAddress ?? null,
    accessToken: session?.accessToken ?? null,
  };
}
