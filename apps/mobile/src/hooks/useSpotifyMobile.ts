import { useEffect, useCallback, useRef } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useSpotifyStore } from "@propilates/shared";
import { ENV } from "../lib/config";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-playback-state",
  "user-modify-playback-state",
];

export function useSpotifyMobile() {
  const store = useSpotifyStore();
  const redirectUri = AuthSession.makeRedirectUri({ scheme: "propilates" });
  const isRefreshingRef = useRef(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: ENV.SPOTIFY_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      exchangeCode(response.params.code);
    }
  }, [response]);

  const exchangeCode = async (code: string) => {
    try {
      const tokenRes = await AuthSession.exchangeCodeAsync(
        {
          clientId: ENV.SPOTIFY_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: request?.codeVerifier ?? "" },
        },
        discovery,
      );
      if (tokenRes.accessToken && tokenRes.refreshToken) {
        store.setTokens(
          tokenRes.accessToken,
          tokenRes.refreshToken,
          tokenRes.expiresIn ?? undefined,
        );
        store.setReady(true);
      }
    } catch (err) {
      console.error("Spotify token exchange failed:", err);
    }
  };

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = useSpotifyStore.getState().refreshToken;
    if (!currentRefreshToken || isRefreshingRef.current) return false;

    isRefreshingRef.current = true;
    try {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: currentRefreshToken,
        client_id: ENV.SPOTIFY_CLIENT_ID,
      });

      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
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

  const login = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

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
