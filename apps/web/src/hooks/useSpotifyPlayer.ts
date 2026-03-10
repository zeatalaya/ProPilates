"use client";

import { useSpotifyPlayerContext } from "@/components/spotify/SpotifyPlayerProvider";

/**
 * Hook to access Spotify playback controls.
 * The actual SDK lifecycle is managed by SpotifyPlayerProvider in layout.tsx.
 * This hook is a thin wrapper that preserves the existing API.
 */
export function useSpotifyPlayer() {
  return useSpotifyPlayerContext();
}
