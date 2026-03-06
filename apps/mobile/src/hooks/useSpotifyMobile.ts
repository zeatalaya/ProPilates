import { useEffect, useCallback } from "react";
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
        store.setTokens(tokenRes.accessToken, tokenRes.refreshToken);
        store.setReady(true);
      }
    } catch (err) {
      console.error("Spotify token exchange failed:", err);
    }
  };

  const login = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const play = useCallback(
    async (uri?: string) => {
      if (!store.accessToken) return;
      const body = uri ? JSON.stringify({ uris: [uri] }) : undefined;
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${store.accessToken}`,
          "Content-Type": "application/json",
        },
        body,
      });
      store.setPlaying(true);
    },
    [store.accessToken],
  );

  const pause = useCallback(async () => {
    if (!store.accessToken) return;
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${store.accessToken}` },
    });
    store.setPlaying(false);
  }, [store.accessToken]);

  const skip = useCallback(async () => {
    if (!store.accessToken) return;
    await fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: { Authorization: `Bearer ${store.accessToken}` },
    });
  }, [store.accessToken]);

  const getCurrentTrack = useCallback(async () => {
    if (!store.accessToken) return null;
    try {
      const res = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${store.accessToken}` } },
      );
      if (!res.ok || res.status === 204) return null;
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
  }, [store.accessToken]);

  return {
    login,
    play,
    pause,
    skip,
    getCurrentTrack,
    isReady: store.isReady,
    isPlaying: store.isPlaying,
    currentTrack: store.currentTrack,
    accessToken: store.accessToken,
    canLogin: !!ENV.SPOTIFY_CLIENT_ID,
  };
}
