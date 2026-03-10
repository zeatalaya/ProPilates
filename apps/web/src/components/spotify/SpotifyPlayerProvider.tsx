"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useSpotifyStore } from "@/stores/spotify";

declare global {
  interface Window {
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

interface SpotifyPlayerContextValue {
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setPlayerVolume: (vol: number) => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue>({
  togglePlay: () => {},
  nextTrack: () => {},
  previousTrack: () => {},
  setPlayerVolume: () => {},
});

export function useSpotifyPlayerContext() {
  return useContext(SpotifyPlayerContext);
}

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const {
    accessToken,
    setTokens,
    setDeviceId,
    setReady,
    setPlaying,
    setCurrentTrack,
    volume,
  } = useSpotifyStore();

  // Extract Spotify tokens from URL hash (after OAuth callback redirect)
  // Moved here so ANY page can receive tokens, not just /builder
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    const params = new URLSearchParams(hash.substring(1));
    const at = params.get("access_token");
    const rt = params.get("refresh_token");
    const ei = params.get("expires_in");

    if (at && rt) {
      setTokens(at, rt, ei ? Number(ei) : undefined);
    }

    // Clean up the hash from the URL
    window.history.replaceState(null, "", window.location.pathname);
  }, [setTokens]);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return;

    // Don't re-init if player already exists and is connected
    if (playerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    scriptRef.current = script;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "ProPilates Studio",
        getOAuthToken: async (cb) => {
          const token = await useSpotifyStore.getState().getValidToken();
          if (token) cb(token);
        },
        volume: volume / 100,
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("[Spotify] Player ready, device:", device_id);
        setDeviceId(device_id);
        setReady(true);
      });

      player.addListener("not_ready", () => {
        console.log("[Spotify] Player not ready");
        setReady(false);
      });

      player.addListener(
        "initialization_error",
        ({ message }: { message: string }) => {
          console.error("[Spotify] Init error:", message);
        },
      );

      player.addListener(
        "authentication_error",
        ({ message }: { message: string }) => {
          console.error("[Spotify] Auth error:", message);
        },
      );

      player.addListener(
        "account_error",
        ({ message }: { message: string }) => {
          console.error("[Spotify] Account error:", message);
        },
      );

      player.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setPlaying(!state.paused);
        const track = state.track_window?.current_track;
        if (track) {
          setCurrentTrack({
            id: track.id,
            name: track.name,
            artist: track.artists.map((a: any) => a.name).join(", "),
            album: track.album.name,
            duration_ms: track.duration_ms,
            uri: track.uri,
            image_url: track.album.images[0]?.url ?? null,
          });
        }
      });

      player.connect();
      playerRef.current = player;
    };

    return () => {
      // Only clean up on full unmount (app close), not on re-renders
      playerRef.current?.disconnect();
      playerRef.current = null;
      scriptRef.current?.remove();
      scriptRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, setDeviceId, setReady, setPlaying, setCurrentTrack]);

  const togglePlay = useCallback(() => {
    playerRef.current?.togglePlay();
  }, []);

  const nextTrack = useCallback(() => {
    playerRef.current?.nextTrack();
  }, []);

  const previousTrack = useCallback(() => {
    playerRef.current?.previousTrack();
  }, []);

  const setPlayerVolume = useCallback((vol: number) => {
    playerRef.current?.setVolume(vol / 100);
  }, []);

  return (
    <SpotifyPlayerContext.Provider
      value={{ togglePlay, nextTrack, previousTrack, setPlayerVolume }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
}
