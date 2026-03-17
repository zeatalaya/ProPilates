import { useCallback, useRef } from "react";
import * as WebBrowser from "expo-web-browser";
import { useSpotifyStore } from "@propilates/shared";
import { ENV } from "../lib/config";

WebBrowser.maybeCompleteAuthSession();

const WEB_APP_URL = "https://pro-pilates.vercel.app";
const SPOTIFY_DEEP_LINK = "propilates://spotify/callback";

export function useSpotifyMobile() {
  const store = useSpotifyStore();
  const isRefreshingRef = useRef(false);

  const login = useCallback(async () => {
    try {
      // Open the web app's Spotify auth route with state=mobile
      // The web server has the client secret and registered redirect URI.
      // After Spotify auth, the web callback deep-links back with tokens.
      const result = await WebBrowser.openAuthSessionAsync(
        `${WEB_APP_URL}/api/auth/spotify?from=mobile`,
        SPOTIFY_DEEP_LINK,
      );

      if (result.type !== "success" || !result.url) return;

      const url = new URL(result.url);
      const error = url.searchParams.get("error");
      if (error) {
        console.error("Spotify auth error:", error);
        return;
      }

      const accessToken = url.searchParams.get("access_token");
      const refreshToken = url.searchParams.get("refresh_token");
      const expiresIn = url.searchParams.get("expires_in");

      if (accessToken && refreshToken) {
        store.setTokens(
          accessToken,
          refreshToken,
          expiresIn ? Number(expiresIn) : undefined,
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
      // Use the web app's refresh endpoint (has client secret)
      const res = await fetch(`${WEB_APP_URL}/api/spotify/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
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
    async (uri?: string) => {
      if (!useSpotifyStore.getState().accessToken) return;
      const body = uri ? JSON.stringify({ uris: [uri] }) : undefined;
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
    refreshToken,
    isReady: store.isReady,
    isPlaying: store.isPlaying,
    currentTrack: store.currentTrack,
    accessToken: store.accessToken,
    canLogin: !!ENV.SPOTIFY_CLIENT_ID,
  };
}
