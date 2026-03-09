import { create } from "zustand";
import type { SpotifyTrack } from "@/types";

interface SpotifyState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // Unix timestamp (ms) when the token expires
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
  reset: () => void;
  /** Refresh the access token using the stored refresh token.
   *  Returns the new access token or null on failure. */
  refreshAccessToken: () => Promise<string | null>;
  /** Get a valid access token, refreshing if necessary */
  getValidToken: () => Promise<string | null>;
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

  setTokens: (accessToken, refreshToken, expiresIn) =>
    set({
      accessToken,
      refreshToken,
      // Default to 55 minutes if not provided (tokens last ~60 min,
      // refresh 5 min early to avoid edge-case failures)
      expiresAt: Date.now() + (expiresIn ?? 3300) * 1000,
    }),
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
      expiresAt: null,
      deviceId: null,
      isReady: false,
      isPlaying: false,
      currentTrack: null,
      queue: [],
      volume: 50,
    }),

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return null;
    try {
      const res = await fetch("/api/spotify/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken = data.access_token as string;
      const expiresIn = (data.expires_in as number) ?? 3300;
      set({
        accessToken: newToken,
        expiresAt: Date.now() + expiresIn * 1000,
      });
      return newToken;
    } catch (err) {
      console.error("[Spotify] Token refresh failed:", err);
      return null;
    }
  },

  getValidToken: async () => {
    const { accessToken, expiresAt, refreshAccessToken } = get();
    // If token expires in less than 2 minutes, proactively refresh
    if (accessToken && expiresAt && expiresAt - Date.now() < 120_000) {
      console.log("[Spotify] Token expiring soon, refreshing...");
      const newToken = await refreshAccessToken();
      return newToken ?? accessToken; // fallback to old token if refresh fails
    }
    return accessToken;
  },
}));
