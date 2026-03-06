import { create } from "zustand";
import type { SpotifyTrack } from "../types";

interface SpotifyState {
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  queue: SpotifyTrack[];
  volume: number;

  setTokens: (access: string, refresh: string) => void;
  setDeviceId: (deviceId: string) => void;
  setReady: (ready: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: SpotifyTrack | null) => void;
  setQueue: (queue: SpotifyTrack[]) => void;
  setVolume: (volume: number) => void;
  reset: () => void;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  accessToken: null,
  refreshToken: null,
  deviceId: null,
  isReady: false,
  isPlaying: false,
  currentTrack: null,
  queue: [],
  volume: 50,

  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setReady: (isReady) => set({ isReady }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setQueue: (queue) => set({ queue }),
  setVolume: (volume) => set({ volume }),
  reset: () =>
    set({
      accessToken: null,
      refreshToken: null,
      deviceId: null,
      isReady: false,
      isPlaying: false,
      currentTrack: null,
      queue: [],
      volume: 50,
    }),
}));
