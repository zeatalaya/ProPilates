import { create } from "zustand";
import type { PilatesMethod, Difficulty } from "@propilates/shared";

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

export const useOnboardingStore = create<OnboardingState>((set) => ({
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
}));
