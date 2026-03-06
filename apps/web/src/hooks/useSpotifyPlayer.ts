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
        getOAuthToken: (cb) => cb(accessToken),
        volume: volume / 100,
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setReady(true);
      });

      player.addListener("not_ready", () => {
        setReady(false);
      });

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
  }, [accessToken, setDeviceId, setReady, setPlaying, setCurrentTrack, volume]);

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
