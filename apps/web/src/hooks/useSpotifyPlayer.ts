"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSpotifyStore } from "@/stores/spotify";

declare global {
  interface Window {
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

export function useSpotifyPlayer() {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const {
    accessToken,
    setDeviceId,
    setReady,
    setPlaying,
    setCurrentTrack,
    volume,
  } = useSpotifyStore();

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "ProPilates Studio",
        // IMPORTANT: Always read the LATEST token from the store.
        // Using a closure over `accessToken` would capture a stale value
        // after token refresh.
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
      playerRef.current?.disconnect();
      script.remove();
    };
    // Only re-init when accessToken changes (not on volume change which would
    // disconnect/reconnect the player unnecessarily)
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

  return { togglePlay, nextTrack, previousTrack, setPlayerVolume };
}
