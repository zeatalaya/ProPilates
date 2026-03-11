import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it("initializes with default state", () => {
    const state = useAuthStore.getState();
    expect(state.instructor).toBeNull();
    expect(state.xionAddress).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.tier).toBe("free");
  });

  it("setXionAddress sets address and marks connected", () => {
    useAuthStore.getState().setXionAddress("xion1abc123");
    const state = useAuthStore.getState();
    expect(state.xionAddress).toBe("xion1abc123");
    expect(state.isConnected).toBe(true);
  });

  it("setXionAddress with null disconnects", () => {
    useAuthStore.getState().setXionAddress("xion1abc123");
    useAuthStore.getState().setXionAddress(null);
    const state = useAuthStore.getState();
    expect(state.xionAddress).toBeNull();
    expect(state.isConnected).toBe(false);
  });

  it("setInstructor updates instructor and tier", () => {
    const instructor = {
      id: "1",
      xion_address: "xion1abc",
      name: "Test",
      bio: "",
      avatar_url: null,
      location: "US",
      languages: ["en"],
      methods: ["mat" as const],
      class_types: ["group" as const],
      equipment: [],
      certifications: [],
      music_style: "",
      favorite_artists: [],
      tier: "premium" as const,
      onboarding_complete: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };
    useAuthStore.getState().setInstructor(instructor);
    const state = useAuthStore.getState();
    expect(state.instructor).toEqual(instructor);
    expect(state.tier).toBe("premium");
  });

  it("setInstructor with null resets tier to free", () => {
    useAuthStore.getState().setTier("premium");
    useAuthStore.getState().setInstructor(null);
    const state = useAuthStore.getState();
    expect(state.instructor).toBeNull();
    expect(state.tier).toBe("free");
  });

  it("setLoading toggles loading state", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("setTier updates tier independently", () => {
    useAuthStore.getState().setTier("premium");
    expect(useAuthStore.getState().tier).toBe("premium");
  });

  it("reset clears all state", () => {
    useAuthStore.getState().setXionAddress("xion1abc");
    useAuthStore.getState().setTier("premium");
    useAuthStore.getState().setLoading(true);
    useAuthStore.getState().reset();
    const state = useAuthStore.getState();
    expect(state.xionAddress).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.tier).toBe("free");
    expect(state.isLoading).toBe(false);
  });
});
