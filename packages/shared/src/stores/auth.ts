import { create } from "zustand";
import type { Instructor, Tier } from "../types";

interface AuthState {
  instructor: Instructor | null;
  xionAddress: string | null;
  oauthAccessToken: string | null;
  isConnected: boolean;
  isLoading: boolean;
  tier: Tier;
  setInstructor: (instructor: Instructor | null) => void;
  setXionAddress: (address: string | null) => void;
  setOAuthAccessToken: (token: string | null) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTier: (tier: Tier) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  instructor: null,
  xionAddress: null,
  oauthAccessToken: null,
  isConnected: false,
  isLoading: true,
  tier: "free",
  setInstructor: (instructor) =>
    set({ instructor, tier: instructor?.tier ?? "free" }),
  setXionAddress: (xionAddress) =>
    set({ xionAddress, isConnected: !!xionAddress }),
  setOAuthAccessToken: (oauthAccessToken) => set({ oauthAccessToken }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setTier: (tier) => set({ tier }),
  reset: () =>
    set({
      instructor: null,
      xionAddress: null,
      oauthAccessToken: null,
      isConnected: false,
      isLoading: false,
      tier: "free",
    }),
}));
