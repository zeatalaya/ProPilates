import { create } from "zustand";
import type { ClassBlock, BlockExercise } from "../types";

interface TeachingModeState {
  blocks: ClassBlock[];
  currentBlockIndex: number;
  currentExerciseIndex: number;
  isPlaying: boolean;
  elapsed: number;
  totalElapsed: number;

  loadBlocks: (blocks: ClassBlock[]) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  tick: () => void;
  skipNext: () => void;
  skipPrev: () => void;
  goToExercise: (blockIndex: number, exerciseIndex: number) => void;
  reset: () => void;

  currentBlock: () => ClassBlock | null;
  currentExercise: () => BlockExercise | null;
  nextExercise: () => BlockExercise | null;
  progress: () => number;
  totalExercises: () => number;
  currentExerciseNumber: () => number;
  isComplete: () => boolean;
}

export const useTeachingModeStore = create<TeachingModeState>((set, get) => ({
  blocks: [],
  currentBlockIndex: 0,
  currentExerciseIndex: 0,
  isPlaying: false,
  elapsed: 0,
  totalElapsed: 0,

  loadBlocks: (blocks) =>
    set({
      blocks,
      currentBlockIndex: 0,
      currentExerciseIndex: 0,
      isPlaying: false,
      elapsed: 0,
      totalElapsed: 0,
    }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((s) => ({ isPlaying: !s.isPlaying })),

  tick: () => {
    const state = get();
    if (!state.isPlaying) return;

    const currentEx = state.currentExercise();
    if (!currentEx) return;

    const newElapsed = state.elapsed + 1;
    const newTotalElapsed = state.totalElapsed + 1;

    if (newElapsed >= currentEx.duration) {
      // Combine skipNext logic and totalElapsed update into one set call
      // to avoid losing totalElapsed when skipNext sets state
      const { blocks, currentBlockIndex, currentExerciseIndex } = get();
      const block = blocks[currentBlockIndex];
      if (!block) return;

      if (currentExerciseIndex < block.exercises.length - 1) {
        set({
          currentExerciseIndex: currentExerciseIndex + 1,
          elapsed: 0,
          totalElapsed: newTotalElapsed,
        });
      } else if (currentBlockIndex < blocks.length - 1) {
        set({
          currentBlockIndex: currentBlockIndex + 1,
          currentExerciseIndex: 0,
          elapsed: 0,
          totalElapsed: newTotalElapsed,
        });
      } else {
        set({ isPlaying: false, totalElapsed: newTotalElapsed });
      }
    } else {
      set({ elapsed: newElapsed, totalElapsed: newTotalElapsed });
    }
  },

  skipNext: () => {
    const { blocks, currentBlockIndex, currentExerciseIndex } = get();
    const block = blocks[currentBlockIndex];
    if (!block) return;

    if (currentExerciseIndex < block.exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1, elapsed: 0 });
    } else if (currentBlockIndex < blocks.length - 1) {
      set({
        currentBlockIndex: currentBlockIndex + 1,
        currentExerciseIndex: 0,
        elapsed: 0,
      });
    } else {
      set({ isPlaying: false });
    }
  },

  skipPrev: () => {
    const { blocks, currentBlockIndex, currentExerciseIndex, elapsed } = get();
    if (elapsed > 3) {
      set({ elapsed: 0 });
      return;
    }
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1, elapsed: 0 });
    } else if (currentBlockIndex > 0) {
      const prevBlock = blocks[currentBlockIndex - 1];
      set({
        currentBlockIndex: currentBlockIndex - 1,
        currentExerciseIndex: prevBlock.exercises.length - 1,
        elapsed: 0,
      });
    }
  },

  goToExercise: (blockIndex, exerciseIndex) => {
    const { blocks } = get();
    if (blocks.length === 0) return;
    const clampedBlock = Math.max(0, Math.min(blockIndex, blocks.length - 1));
    const block = blocks[clampedBlock];
    const clampedExercise = Math.max(
      0,
      Math.min(exerciseIndex, block.exercises.length - 1),
    );
    set({
      currentBlockIndex: clampedBlock,
      currentExerciseIndex: clampedExercise,
      elapsed: 0,
    });
  },

  reset: () =>
    set({
      blocks: [],
      currentBlockIndex: 0,
      currentExerciseIndex: 0,
      isPlaying: false,
      elapsed: 0,
      totalElapsed: 0,
    }),

  currentBlock: () => get().blocks[get().currentBlockIndex] ?? null,

  currentExercise: () => {
    const block = get().currentBlock();
    return block?.exercises[get().currentExerciseIndex] ?? null;
  },

  nextExercise: () => {
    const { blocks, currentBlockIndex, currentExerciseIndex } = get();
    const block = blocks[currentBlockIndex];
    if (!block) return null;

    if (currentExerciseIndex < block.exercises.length - 1) {
      return block.exercises[currentExerciseIndex + 1];
    }
    if (currentBlockIndex < blocks.length - 1) {
      return blocks[currentBlockIndex + 1]?.exercises[0] ?? null;
    }
    return null;
  },

  progress: () => {
    const ex = get().currentExercise();
    if (!ex || ex.duration === 0) return 0;
    return Math.min(get().elapsed / ex.duration, 1);
  },

  totalExercises: () =>
    get().blocks.reduce((sum, b) => sum + b.exercises.length, 0),

  currentExerciseNumber: () => {
    const { blocks, currentBlockIndex, currentExerciseIndex } = get();
    let count = 0;
    for (let bi = 0; bi < currentBlockIndex; bi++) {
      count += blocks[bi].exercises.length;
    }
    return count + currentExerciseIndex + 1;
  },

  isComplete: () => {
    const { blocks, currentBlockIndex, currentExerciseIndex, elapsed } = get();
    const lastBlock = blocks[blocks.length - 1];
    if (!lastBlock) return false;
    return (
      currentBlockIndex === blocks.length - 1 &&
      currentExerciseIndex === lastBlock.exercises.length - 1 &&
      elapsed >=
        (lastBlock.exercises[lastBlock.exercises.length - 1]?.duration ?? 0)
    );
  },
}));
