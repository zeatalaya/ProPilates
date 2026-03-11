import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Platform } from "react-native";
import type { PilatesMethod, Difficulty } from "@propilates/shared";

let storageAdapter: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

if (Platform.OS !== "web") {
  const SecureStore = require("expo-secure-store");
  storageAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) =>
      SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
} else {
  storageAdapter = {
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) =>
      localStorage.setItem(key, value),
    removeItem: async (key: string) => localStorage.removeItem(key),
  };
}

interface OnboardingState {
  name: string;
  bio: string;
  location: string;
  methods: PilatesMethod[];
  difficulty: Difficulty;
  setPersonal: (name: string, bio: string, location: string) => void;
  setPractice: (methods: PilatesMethod[], difficulty: Difficulty) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      name: "",
      bio: "",
      location: "",
      methods: [],
      difficulty: "beginner",
      setPersonal: (name, bio, location) => set({ name, bio, location }),
      setPractice: (methods, difficulty) => set({ methods, difficulty }),
      reset: () =>
        set({
          name: "",
          bio: "",
          location: "",
          methods: [],
          difficulty: "beginner",
        }),
    }),
    {
      name: "propilates-onboarding",
      storage: createJSONStorage(() => storageAdapter),
    },
  ),
);
