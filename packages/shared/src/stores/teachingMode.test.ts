import { describe, it, expect, beforeEach } from "vitest";
import { useTeachingModeStore } from "./teachingMode";
import type { ClassBlock, BlockExercise, Exercise } from "../types";

function makeExercise(id: string, duration: number): BlockExercise {
  return {
    id,
    block_id: "b1",
    exercise_id: `ex-${id}`,
    order_index: 0,
    duration,
    reps: null,
    side: null,
    notes: "",
    exercise: {
      id: `ex-${id}`,
      name: `Exercise ${id}`,
      method: "mat",
      category: "warmup",
      difficulty: "beginner",
      muscle_groups: ["core"],
      description: "",
      cues: [],
      default_duration: duration,
      image_url: null,
      video_url: null,
      objective: null,
      apparatus: null,
      start_position: null,
      movement: null,
      pace: null,
      school: null,
    },
  };
}

function makeBlocks(): ClassBlock[] {
  return [
    {
      id: "b1",
      class_id: "c1",
      name: "Warm Up",
      order_index: 0,
      exercises: [
        { ...makeExercise("1", 10), order_index: 0 },
        { ...makeExercise("2", 20), order_index: 1 },
      ],
    },
    {
      id: "b2",
      class_id: "c1",
      name: "Main",
      order_index: 1,
      exercises: [
        { ...makeExercise("3", 30), block_id: "b2", order_index: 0 },
        { ...makeExercise("4", 15), block_id: "b2", order_index: 1 },
      ],
    },
  ];
}

describe("teachingModeStore", () => {
  beforeEach(() => {
    useTeachingModeStore.getState().reset();
  });

  describe("initialization", () => {
    it("starts with empty state", () => {
      const state = useTeachingModeStore.getState();
      expect(state.blocks).toEqual([]);
      expect(state.currentBlockIndex).toBe(0);
      expect(state.currentExerciseIndex).toBe(0);
      expect(state.isPlaying).toBe(false);
      expect(state.elapsed).toBe(0);
      expect(state.totalElapsed).toBe(0);
    });
  });

  describe("loadBlocks", () => {
    it("loads blocks and resets indices", () => {
      const blocks = makeBlocks();
      useTeachingModeStore.getState().loadBlocks(blocks);
      const state = useTeachingModeStore.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.currentBlockIndex).toBe(0);
      expect(state.currentExerciseIndex).toBe(0);
      expect(state.isPlaying).toBe(false);
    });
  });

  describe("play/pause", () => {
    it("play sets isPlaying true", () => {
      useTeachingModeStore.getState().play();
      expect(useTeachingModeStore.getState().isPlaying).toBe(true);
    });

    it("pause sets isPlaying false", () => {
      useTeachingModeStore.getState().play();
      useTeachingModeStore.getState().pause();
      expect(useTeachingModeStore.getState().isPlaying).toBe(false);
    });

    it("togglePlayPause toggles", () => {
      useTeachingModeStore.getState().togglePlayPause();
      expect(useTeachingModeStore.getState().isPlaying).toBe(true);
      useTeachingModeStore.getState().togglePlayPause();
      expect(useTeachingModeStore.getState().isPlaying).toBe(false);
    });
  });

  describe("tick", () => {
    it("does nothing when not playing", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().tick();
      expect(useTeachingModeStore.getState().elapsed).toBe(0);
    });

    it("increments elapsed when playing", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().play();
      useTeachingModeStore.getState().tick();
      expect(useTeachingModeStore.getState().elapsed).toBe(1);
      expect(useTeachingModeStore.getState().totalElapsed).toBe(1);
    });

    it("auto-advances to next exercise when duration reached", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().play();
      // First exercise has duration 10, tick 10 times
      for (let i = 0; i < 10; i++) {
        useTeachingModeStore.getState().tick();
      }
      const state = useTeachingModeStore.getState();
      expect(state.currentExerciseIndex).toBe(1);
      expect(state.elapsed).toBe(0);
    });

    it("auto-advances to next block", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().play();
      // Ex1: 10 ticks, Ex2: 20 ticks = move to block 2
      for (let i = 0; i < 30; i++) {
        useTeachingModeStore.getState().tick();
      }
      const state = useTeachingModeStore.getState();
      expect(state.currentBlockIndex).toBe(1);
      expect(state.currentExerciseIndex).toBe(0);
    });

    it("stops playing at end of last exercise", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().play();
      // Total: 10 + 20 + 30 + 15 = 75 ticks
      for (let i = 0; i < 75; i++) {
        useTeachingModeStore.getState().tick();
      }
      expect(useTeachingModeStore.getState().isPlaying).toBe(false);
    });
  });

  describe("skipNext", () => {
    it("moves to next exercise in same block", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().skipNext();
      const state = useTeachingModeStore.getState();
      expect(state.currentBlockIndex).toBe(0);
      expect(state.currentExerciseIndex).toBe(1);
      expect(state.elapsed).toBe(0);
    });

    it("moves to next block when at end of current", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().skipNext(); // ex 0->1
      useTeachingModeStore.getState().skipNext(); // block 0->1
      const state = useTeachingModeStore.getState();
      expect(state.currentBlockIndex).toBe(1);
      expect(state.currentExerciseIndex).toBe(0);
    });

    it("stops playing at the very end", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().play();
      // Skip to the very last exercise
      useTeachingModeStore.getState().skipNext(); // b0 ex1
      useTeachingModeStore.getState().skipNext(); // b1 ex0
      useTeachingModeStore.getState().skipNext(); // b1 ex1
      useTeachingModeStore.getState().skipNext(); // end - stops playing
      expect(useTeachingModeStore.getState().isPlaying).toBe(false);
    });
  });

  describe("skipPrev", () => {
    it("resets elapsed if > 3 seconds", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().play();
      for (let i = 0; i < 5; i++) {
        useTeachingModeStore.getState().tick();
      }
      useTeachingModeStore.getState().skipPrev();
      expect(useTeachingModeStore.getState().elapsed).toBe(0);
      expect(useTeachingModeStore.getState().currentExerciseIndex).toBe(0);
    });

    it("goes to previous exercise if elapsed <= 3", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().skipNext(); // move to ex 1
      useTeachingModeStore.getState().skipPrev(); // back to ex 0
      expect(useTeachingModeStore.getState().currentExerciseIndex).toBe(0);
    });

    it("goes to previous block last exercise", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().goToExercise(1, 0);
      useTeachingModeStore.getState().skipPrev();
      const state = useTeachingModeStore.getState();
      expect(state.currentBlockIndex).toBe(0);
      expect(state.currentExerciseIndex).toBe(1); // last exercise of prev block
    });
  });

  describe("goToExercise", () => {
    it("jumps to specific exercise", () => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
      useTeachingModeStore.getState().goToExercise(1, 1);
      const state = useTeachingModeStore.getState();
      expect(state.currentBlockIndex).toBe(1);
      expect(state.currentExerciseIndex).toBe(1);
      expect(state.elapsed).toBe(0);
    });
  });

  describe("computed values", () => {
    beforeEach(() => {
      useTeachingModeStore.getState().loadBlocks(makeBlocks());
    });

    it("currentBlock returns current block", () => {
      expect(useTeachingModeStore.getState().currentBlock()?.name).toBe("Warm Up");
    });

    it("currentExercise returns current exercise", () => {
      expect(useTeachingModeStore.getState().currentExercise()?.duration).toBe(10);
    });

    it("nextExercise returns next in same block", () => {
      expect(useTeachingModeStore.getState().nextExercise()?.duration).toBe(20);
    });

    it("nextExercise returns first of next block at end of current", () => {
      useTeachingModeStore.getState().skipNext(); // move to last ex of block 0
      expect(useTeachingModeStore.getState().nextExercise()?.duration).toBe(30);
    });

    it("nextExercise returns null at very end", () => {
      useTeachingModeStore.getState().goToExercise(1, 1);
      expect(useTeachingModeStore.getState().nextExercise()).toBeNull();
    });

    it("progress returns fraction of current exercise", () => {
      useTeachingModeStore.getState().play();
      for (let i = 0; i < 5; i++) {
        useTeachingModeStore.getState().tick();
      }
      expect(useTeachingModeStore.getState().progress()).toBe(0.5); // 5/10
    });

    it("progress caps at 1", () => {
      useTeachingModeStore.getState().pause(); // prevent auto-advance
      // Manually set elapsed beyond duration
      useTeachingModeStore.setState({ elapsed: 999 });
      expect(useTeachingModeStore.getState().progress()).toBe(1);
    });

    it("totalExercises counts all exercises", () => {
      expect(useTeachingModeStore.getState().totalExercises()).toBe(4);
    });

    it("currentExerciseNumber returns 1-based position", () => {
      expect(useTeachingModeStore.getState().currentExerciseNumber()).toBe(1);
      useTeachingModeStore.getState().goToExercise(1, 0);
      expect(useTeachingModeStore.getState().currentExerciseNumber()).toBe(3);
      useTeachingModeStore.getState().goToExercise(1, 1);
      expect(useTeachingModeStore.getState().currentExerciseNumber()).toBe(4);
    });

    it("isComplete detects completion", () => {
      expect(useTeachingModeStore.getState().isComplete()).toBe(false);
      useTeachingModeStore.getState().goToExercise(1, 1);
      // Set elapsed to match duration of last exercise (15)
      useTeachingModeStore.setState({ elapsed: 15 });
      expect(useTeachingModeStore.getState().isComplete()).toBe(true);
    });

    it("isComplete false when not at last exercise", () => {
      useTeachingModeStore.setState({ elapsed: 999 });
      expect(useTeachingModeStore.getState().isComplete()).toBe(false);
    });
  });

  describe("currentBlock/currentExercise with empty blocks", () => {
    it("returns null for empty blocks", () => {
      expect(useTeachingModeStore.getState().currentBlock()).toBeNull();
      expect(useTeachingModeStore.getState().currentExercise()).toBeNull();
    });

    it("progress returns 0 with no exercise", () => {
      expect(useTeachingModeStore.getState().progress()).toBe(0);
    });
  });
});
