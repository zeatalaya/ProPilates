import { create } from "zustand";
import type { SpotifyTrack } from "../types";

interface SpotifyState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  deviceId: string | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  volume: number;

  setTokens: (access: string, refresh: string, expiresIn?: number) => void;
  setDeviceId: (deviceId: string) => void;
  setReady: (ready: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  setQueue: (queue: SpotifyTrack[]) => void;
  setVolume: (volume: number) => void;
  isTokenExpired: () => boolean;
  reset: () => void;
}

export const useSpotifyStore = create<SpotifyState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  deviceId: null,
  isReady: false,
  isPlaying: false,
  currentTrack: null,
  queue: [],
  volume: 50,

  setTokens: (accessToken, refreshToken, expiresIn?) =>
    set({
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
    }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setReady: (isReady) => set({ isReady }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setQueue: (queue) => set({ queue }),
  setVolume: (volume) => set({ volume }),
  isTokenExpired: () => {
    const { expiresAt } = get();
    if (!expiresAt) return false;
    return expiresAt < Date.now();
  },
  reset: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      deviceId: null,
      isReady: false,
      isPlaying: false,
      currentTrack: null,
      queue: [],
      volume: 50,
    }),
}));
