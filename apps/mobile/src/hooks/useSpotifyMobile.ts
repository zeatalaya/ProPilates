import { useCallback, useRef } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { useSpotifyStore } from "@propilates/shared";
import { ENV } from "../lib/config";

WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const REDIRECT_URI = "propilates://spotify/callback";

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

// ── PKCE helpers ──

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generatePKCE() {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const verifier = base64UrlEncode(new Uint8Array(randomBytes));
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  const challenge = digest
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return { verifier, challenge };
}

// ── Hook ──

export function useSpotifyMobile() {
  const store = useSpotifyStore();
  const isRefreshingRef = useRef(false);

  const login = useCallback(async () => {
    try {
      const { verifier, challenge } = await generatePKCE();

      const params = new URLSearchParams({
        client_id: ENV.SPOTIFY_CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        code_challenge_method: "S256",
        code_challenge: challenge,
      });

      const result = await WebBrowser.openAuthSessionAsync(
        `${SPOTIFY_AUTH_URL}?${params}`,
        REDIRECT_URI,
      );

      if (result.type !== "success" || !result.url) return;

      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error || !code) {
        console.error("Spotify auth error:", error);
        return;
      }

      // Exchange code for tokens using PKCE (no client secret needed)
      const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: ENV.SPOTIFY_CLIENT_ID,
          code_verifier: verifier,
        }).toString(),
      });

      if (!tokenRes.ok) {
        console.error("Spotify token exchange failed:", tokenRes.status);
        return;
      }

      const data = await tokenRes.json();
      if (data.access_token && data.refresh_token) {
        store.setTokens(
          data.access_token,
          data.refresh_token,
          data.expires_in ?? undefined,
        );
        store.setReady(true);
      }
    } catch (err) {
      console.error("Spotify login failed:", err);
    }
  }, [store]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = useSpotifyStore.getState().refreshToken;
    if (!currentRefreshToken || isRefreshingRef.current) return false;

    isRefreshingRef.current = true;
    try {
      const res = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: currentRefreshToken,
          client_id: ENV.SPOTIFY_CLIENT_ID,
        }).toString(),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.access_token) {
        store.setTokens(
          data.access_token,
          data.refresh_token ?? currentRefreshToken,
          data.expires_in ?? undefined,
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Spotify token refresh failed:", err);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [store]);

  const spotifyFetch = useCallback(
    async (
      url: string,
      options: RequestInit = {},
    ): Promise<Response | null> => {
      const token = useSpotifyStore.getState().accessToken;
      if (!token) return null;

      const doFetch = (accessToken: string) =>
        fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        });

      let res = await doFetch(token);

      if (res.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = useSpotifyStore.getState().accessToken;
          if (newToken) {
            res = await doFetch(newToken);
          }
        }
      }

      return res;
    },
    [refreshToken],
  );

  const play = useCallback(
    async (uri?: string, contextUri?: string) => {
      if (!useSpotifyStore.getState().accessToken) return;
      let body: string | undefined;
      if (contextUri) {
        body = JSON.stringify({ context_uri: contextUri });
      } else if (uri) {
        body = JSON.stringify({ uris: [uri] });
      }
      const res = await spotifyFetch(
        "https://api.spotify.com/v1/me/player/play",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );
      if (res?.ok) {
        store.setPlaying(true);
      }
    },
    [spotifyFetch, store],
  );

  const getPlaylists = useCallback(async () => {
    if (!useSpotifyStore.getState().accessToken) return [];
    try {
      const res = await spotifyFetch(
        "https://api.spotify.com/v1/me/playlists?limit=50",
      );
      if (!res || !res.ok) return [];
      const data = await res.json();
      return (data.items ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        uri: p.uri,
        image: p.images?.[0]?.url ?? null,
        trackCount: typeof p.tracks === "object" ? (p.tracks?.total ?? 0) : 0,
        owner: p.owner?.display_name ?? "",
      }));
    } catch {
      return [];
    }
  }, [spotifyFetch]);

  const getDevices = useCallback(async () => {
    if (!useSpotifyStore.getState().accessToken) return [];
    try {
      const res = await spotifyFetch(
        "https://api.spotify.com/v1/me/player/devices",
      );
      if (!res || !res.ok) return [];
      const data = await res.json();
      return data.devices ?? [];
    } catch {
      return [];
    }
  }, [spotifyFetch]);

  const transferPlayback = useCallback(async (deviceId: string) => {
    await spotifyFetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    });
  }, [spotifyFetch]);

  const pause = useCallback(async () => {
    if (!useSpotifyStore.getState().accessToken) return;
    const res = await spotifyFetch(
      "https://api.spotify.com/v1/me/player/pause",
      { method: "PUT" },
    );
    if (res?.ok) {
      store.setPlaying(false);
    }
  }, [spotifyFetch, store]);

  const skip = useCallback(async () => {
    if (!useSpotifyStore.getState().accessToken) return;
    const res = await spotifyFetch(
      "https://api.spotify.com/v1/me/player/next",
      { method: "POST" },
    );
    if (!res?.ok) {
      console.error("Spotify skip failed:", res?.status);
    }
  }, [spotifyFetch]);

  const getCurrentTrack = useCallback(async () => {
    if (!useSpotifyStore.getState().accessToken) return null;
    try {
      const res = await spotifyFetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
      );
      if (!res || !res.ok || res.status === 204) return null;
      const data = await res.json();
      if (!data.item) return null;
      const track = {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists?.map((a: any) => a.name).join(", ") ?? "",
        album: data.item.album?.name ?? "",
        duration_ms: data.item.duration_ms,
        uri: data.item.uri,
        image_url: data.item.album?.images?.[0]?.url ?? null,
      };
      store.setCurrentTrack(track);
      store.setPlaying(data.is_playing);
      return track;
    } catch {
      return null;
    }
  }, [spotifyFetch, store]);

  return {
    login,
    play,
    pause,
    skip,
    getCurrentTrack,
    getPlaylists,
    getDevices,
    transferPlayback,
    refreshToken,
    isReady: store.isReady,
    isPlaying: store.isPlaying,
    currentTrack: store.currentTrack,
    accessToken: store.accessToken,
    canLogin: !!ENV.SPOTIFY_CLIENT_ID,
  };
}
