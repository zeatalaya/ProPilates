import { describe, it, expect, beforeEach } from "vitest";
import { useSpotifyStore } from "./spotify";
import type { SpotifyTrack } from "../types";

const mockTrack: SpotifyTrack = {
  id: "track-1",
  name: "Breathe",
  artist: "Artist",
  album: "Album",
  duration_ms: 180000,
  uri: "spotify:track:abc",
  image_url: null,
};

describe("spotifyStore", () => {
  beforeEach(() => {
    useSpotifyStore.getState().reset();
  });

  it("initializes with default state", () => {
    const state = useSpotifyStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.deviceId).toBeNull();
    expect(state.isReady).toBe(false);
    expect(state.isPlaying).toBe(false);
    expect(state.currentTrack).toBeNull();
    expect(state.queue).toEqual([]);
    expect(state.volume).toBe(50);
  });

  it("setTokens sets both tokens", () => {
    useSpotifyStore.getState().setTokens("access-123", "refresh-456");
    const state = useSpotifyStore.getState();
    expect(state.accessToken).toBe("access-123");
    expect(state.refreshToken).toBe("refresh-456");
  });

  it("setDeviceId sets device", () => {
    useSpotifyStore.getState().setDeviceId("device-1");
    expect(useSpotifyStore.getState().deviceId).toBe("device-1");
  });

  it("setReady toggles ready state", () => {
    useSpotifyStore.getState().setReady(true);
    expect(useSpotifyStore.getState().isReady).toBe(true);
  });

  it("setPlaying toggles playing state", () => {
    useSpotifyStore.getState().setPlaying(true);
    expect(useSpotifyStore.getState().isPlaying).toBe(true);
  });

  it("setCurrentTrack sets track", () => {
    useSpotifyStore.getState().setCurrentTrack(mockTrack);
    expect(useSpotifyStore.getState().currentTrack).toEqual(mockTrack);
  });

  it("setCurrentTrack clears with null", () => {
    useSpotifyStore.getState().setCurrentTrack(mockTrack);
    useSpotifyStore.getState().setCurrentTrack(null);
    expect(useSpotifyStore.getState().currentTrack).toBeNull();
  });

  it("setQueue sets track list", () => {
    useSpotifyStore.getState().setQueue([mockTrack]);
    expect(useSpotifyStore.getState().queue).toHaveLength(1);
  });

  it("setVolume sets volume", () => {
    useSpotifyStore.getState().setVolume(75);
    expect(useSpotifyStore.getState().volume).toBe(75);
  });

  it("setTokens with expiresIn sets expiresAt", () => {
    const before = Date.now();
    useSpotifyStore.getState().setTokens("a", "b", 3600);
    const state = useSpotifyStore.getState();
    expect(state.expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000);
  });

  it("setTokens without expiresIn leaves expiresAt null", () => {
    useSpotifyStore.getState().setTokens("a", "b");
    expect(useSpotifyStore.getState().expiresAt).toBeNull();
  });

  it("isTokenExpired returns false when no expiresAt", () => {
    expect(useSpotifyStore.getState().isTokenExpired()).toBe(false);
  });

  it("isTokenExpired returns true when expired", () => {
    useSpotifyStore.getState().setTokens("a", "b", -1);
    expect(useSpotifyStore.getState().isTokenExpired()).toBe(true);
  });

  it("reset clears everything", () => {
    useSpotifyStore.getState().setTokens("a", "b");
    useSpotifyStore.getState().setDeviceId("d");
    useSpotifyStore.getState().setReady(true);
    useSpotifyStore.getState().setPlaying(true);
    useSpotifyStore.getState().setCurrentTrack(mockTrack);
    useSpotifyStore.getState().setQueue([mockTrack]);
    useSpotifyStore.getState().setVolume(100);
    useSpotifyStore.getState().reset();
    const state = useSpotifyStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.deviceId).toBeNull();
    expect(state.isReady).toBe(false);
    expect(state.isPlaying).toBe(false);
    expect(state.currentTrack).toBeNull();
    expect(state.queue).toEqual([]);
    expect(state.volume).toBe(50);
  });
});
