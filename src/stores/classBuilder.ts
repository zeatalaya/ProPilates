import { create } from "zustand";
import type {
  PilatesMethod,
  ClassType,
  Difficulty,
  ClassBlock,
  BlockExercise,
  Exercise,
} from "@/types";

interface ClassBuilderState {
  // Class metadata
  title: string;
  description: string;
  method: PilatesMethod;
  classType: ClassType;
  difficulty: Difficulty;
  durationMinutes: number;
  playlistId: string | null;

  // Blocks & exercises
  blocks: ClassBlock[];
  selectedBlockId: string | null;
  selectedExerciseId: string | null;

  // Filter state for exercise browser
  browserSearch: string;
  browserMethod: PilatesMethod | "all";
  browserCategory: string;
  browserDifficulty: string;

  // Actions - metadata
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setMethod: (method: PilatesMethod) => void;
  setClassType: (classType: ClassType) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setDurationMinutes: (minutes: number) => void;
  setPlaylistId: (id: string | null) => void;

  // Actions - blocks
  addBlock: (name: string) => void;
  removeBlock: (blockId: string) => void;
  renameBlock: (blockId: string, name: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  selectBlock: (blockId: string | null) => void;

  // Actions - exercises in block
  addExerciseToBlock: (blockId: string, exercise: Exercise) => void;
  removeExerciseFromBlock: (blockId: string, exerciseId: string) => void;
  updateBlockExercise: (
    blockId: string,
    exerciseId: string,
    updates: Partial<BlockExercise>,
  ) => void;
  reorderExercisesInBlock: (
    blockId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  selectExercise: (exerciseId: string | null) => void;

  // Actions - browser filters
  setBrowserSearch: (search: string) => void;
  setBrowserMethod: (method: PilatesMethod | "all") => void;
  setBrowserCategory: (category: string) => void;
  setBrowserDifficulty: (difficulty: string) => void;

  // Actions - class lifecycle
  loadClass: (data: {
    title: string;
    description: string;
    method: PilatesMethod;
    classType: ClassType;
    difficulty: Difficulty;
    durationMinutes: number;
    playlistId: string | null;
    blocks: ClassBlock[];
  }) => void;
  resetBuilder: () => void;

  // Computed
  totalDuration: () => number;
}

function generateId() {
  return crypto.randomUUID();
}

const initialState = {
  title: "",
  description: "",
  method: "mat" as PilatesMethod,
  classType: "group" as ClassType,
  difficulty: "intermediate" as Difficulty,
  durationMinutes: 55,
  playlistId: null,
  blocks: [],
  selectedBlockId: null,
  selectedExerciseId: null,
  browserSearch: "",
  browserMethod: "all" as PilatesMethod | "all",
  browserCategory: "",
  browserDifficulty: "",
};

export const useClassBuilderStore = create<ClassBuilderState>((set, get) => ({
  ...initialState,

  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setMethod: (method) => set({ method }),
  setClassType: (classType) => set({ classType }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setDurationMinutes: (durationMinutes) => set({ durationMinutes }),
  setPlaylistId: (playlistId) => set({ playlistId }),

  addBlock: (name) => {
    const newBlock: ClassBlock = {
      id: generateId(),
      class_id: "",
      name,
      order_index: get().blocks.length,
      exercises: [],
    };
    set((s) => ({
      blocks: [...s.blocks, newBlock],
      selectedBlockId: newBlock.id,
    }));
  },

  removeBlock: (blockId) =>
    set((s) => ({
      blocks: s.blocks
        .filter((b) => b.id !== blockId)
        .map((b, i) => ({ ...b, order_index: i })),
      selectedBlockId:
        s.selectedBlockId === blockId ? null : s.selectedBlockId,
    })),

  renameBlock: (blockId, name) =>
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, name } : b)),
    })),

  reorderBlocks: (fromIndex, toIndex) =>
    set((s) => {
      const blocks = [...s.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { blocks: blocks.map((b, i) => ({ ...b, order_index: i })) };
    }),

  selectBlock: (selectedBlockId) => set({ selectedBlockId }),

  addExerciseToBlock: (blockId, exercise) =>
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (b.id !== blockId) return b;
        const newEx: BlockExercise = {
          id: generateId(),
          block_id: blockId,
          exercise_id: exercise.id,
          exercise,
          order_index: b.exercises.length,
          duration: exercise.default_duration,
          reps: null,
          side: null,
          notes: "",
        };
        return { ...b, exercises: [...b.exercises, newEx] };
      }),
    })),

  removeExerciseFromBlock: (blockId, exerciseId) =>
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          exercises: b.exercises
            .filter((e) => e.id !== exerciseId)
            .map((e, i) => ({ ...e, order_index: i })),
        };
      }),
    })),

  updateBlockExercise: (blockId, exerciseId, updates) =>
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          exercises: b.exercises.map((e) =>
            e.id === exerciseId ? { ...e, ...updates } : e,
          ),
        };
      }),
    })),

  reorderExercisesInBlock: (blockId, fromIndex, toIndex) =>
    set((s) => ({
      blocks: s.blocks.map((b) => {
        if (b.id !== blockId) return b;
        const exercises = [...b.exercises];
        const [moved] = exercises.splice(fromIndex, 1);
        exercises.splice(toIndex, 0, moved);
        return {
          ...b,
          exercises: exercises.map((e, i) => ({ ...e, order_index: i })),
        };
      }),
    })),

  selectExercise: (selectedExerciseId) => set({ selectedExerciseId }),

  setBrowserSearch: (browserSearch) => set({ browserSearch }),
  setBrowserMethod: (browserMethod) => set({ browserMethod }),
  setBrowserCategory: (browserCategory) => set({ browserCategory }),
  setBrowserDifficulty: (browserDifficulty) => set({ browserDifficulty }),

  loadClass: (data) =>
    set({
      title: data.title,
      description: data.description,
      method: data.method,
      classType: data.classType,
      difficulty: data.difficulty,
      durationMinutes: data.durationMinutes,
      playlistId: data.playlistId,
      blocks: data.blocks,
      selectedBlockId: data.blocks[0]?.id ?? null,
      selectedExerciseId: null,
    }),

  resetBuilder: () => set(initialState),

  totalDuration: () =>
    get().blocks.reduce(
      (total, block) =>
        total + block.exercises.reduce((bt, ex) => bt + ex.duration, 0),
      0,
    ),
}));
