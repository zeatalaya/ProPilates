import { describe, it, expect, beforeEach, vi } from "vitest";
import { useClassBuilderStore } from "./classBuilder";
import type { Exercise, ClassBlock } from "../types";

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal("crypto", {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

const mockExercise: Exercise = {
  id: "ex-1",
  name: "The Hundred",
  method: "mat",
  category: "warmup",
  difficulty: "intermediate",
  muscle_groups: ["core"],
  description: "Classic Pilates warmup",
  cues: ["Pump arms", "Breathe"],
  default_duration: 60,
  image_url: null,
  video_url: null,
  objective: null,
  apparatus: null,
  start_position: null,
  movement: null,
  pace: null,
  school: null,
};

const mockExercise2: Exercise = {
  ...mockExercise,
  id: "ex-2",
  name: "Roll Up",
  category: "strength",
  default_duration: 45,
};

describe("classBuilderStore", () => {
  beforeEach(() => {
    uuidCounter = 0;
    useClassBuilderStore.getState().resetBuilder();
  });

  describe("metadata setters", () => {
    it("sets title", () => {
      useClassBuilderStore.getState().setTitle("Morning Flow");
      expect(useClassBuilderStore.getState().title).toBe("Morning Flow");
    });

    it("sets description", () => {
      useClassBuilderStore.getState().setDescription("A gentle class");
      expect(useClassBuilderStore.getState().description).toBe("A gentle class");
    });

    it("sets method", () => {
      useClassBuilderStore.getState().setMethod("reformer");
      expect(useClassBuilderStore.getState().method).toBe("reformer");
    });

    it("sets classType", () => {
      useClassBuilderStore.getState().setClassType("private");
      expect(useClassBuilderStore.getState().classType).toBe("private");
    });

    it("sets difficulty", () => {
      useClassBuilderStore.getState().setDifficulty("advanced");
      expect(useClassBuilderStore.getState().difficulty).toBe("advanced");
    });

    it("sets durationMinutes", () => {
      useClassBuilderStore.getState().setDurationMinutes(45);
      expect(useClassBuilderStore.getState().durationMinutes).toBe(45);
    });

    it("sets playlistId", () => {
      useClassBuilderStore.getState().setPlaylistId("playlist-1");
      expect(useClassBuilderStore.getState().playlistId).toBe("playlist-1");
    });
  });

  describe("block management", () => {
    it("adds a block", () => {
      useClassBuilderStore.getState().addBlock("Warm Up");
      const blocks = useClassBuilderStore.getState().blocks;
      expect(blocks).toHaveLength(1);
      expect(blocks[0].name).toBe("Warm Up");
      expect(blocks[0].order_index).toBe(0);
      expect(blocks[0].exercises).toEqual([]);
    });

    it("auto-selects newly added block", () => {
      useClassBuilderStore.getState().addBlock("Warm Up");
      const state = useClassBuilderStore.getState();
      expect(state.selectedBlockId).toBe(state.blocks[0].id);
    });

    it("adds multiple blocks with correct order", () => {
      const store = useClassBuilderStore.getState();
      store.addBlock("Warm Up");
      store.addBlock("Main");
      store.addBlock("Cool Down");
      const blocks = useClassBuilderStore.getState().blocks;
      expect(blocks).toHaveLength(3);
      expect(blocks[0].order_index).toBe(0);
      expect(blocks[1].order_index).toBe(1);
      expect(blocks[2].order_index).toBe(2);
    });

    it("removes a block and reindexes", () => {
      const store = useClassBuilderStore.getState();
      store.addBlock("A");
      store.addBlock("B");
      store.addBlock("C");
      const blockBId = useClassBuilderStore.getState().blocks[1].id;
      useClassBuilderStore.getState().removeBlock(blockBId);
      const blocks = useClassBuilderStore.getState().blocks;
      expect(blocks).toHaveLength(2);
      expect(blocks[0].name).toBe("A");
      expect(blocks[0].order_index).toBe(0);
      expect(blocks[1].name).toBe("C");
      expect(blocks[1].order_index).toBe(1);
    });

    it("clears selectedBlockId when removing selected block", () => {
      useClassBuilderStore.getState().addBlock("A");
      const blockId = useClassBuilderStore.getState().blocks[0].id;
      useClassBuilderStore.getState().selectBlock(blockId);
      useClassBuilderStore.getState().removeBlock(blockId);
      expect(useClassBuilderStore.getState().selectedBlockId).toBeNull();
    });

    it("renames a block", () => {
      useClassBuilderStore.getState().addBlock("Old Name");
      const blockId = useClassBuilderStore.getState().blocks[0].id;
      useClassBuilderStore.getState().renameBlock(blockId, "New Name");
      expect(useClassBuilderStore.getState().blocks[0].name).toBe("New Name");
    });

    it("reorders blocks", () => {
      const store = useClassBuilderStore.getState();
      store.addBlock("A");
      store.addBlock("B");
      store.addBlock("C");
      useClassBuilderStore.getState().reorderBlocks(0, 2);
      const blocks = useClassBuilderStore.getState().blocks;
      expect(blocks[0].name).toBe("B");
      expect(blocks[1].name).toBe("C");
      expect(blocks[2].name).toBe("A");
      expect(blocks[0].order_index).toBe(0);
      expect(blocks[1].order_index).toBe(1);
      expect(blocks[2].order_index).toBe(2);
    });
  });

  describe("exercise management", () => {
    let blockId: string;

    beforeEach(() => {
      uuidCounter = 0;
      useClassBuilderStore.getState().resetBuilder();
      useClassBuilderStore.getState().addBlock("Warm Up");
      blockId = useClassBuilderStore.getState().blocks[0].id;
    });

    it("adds exercise to block", () => {
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise);
      const exercises = useClassBuilderStore.getState().blocks[0].exercises;
      expect(exercises).toHaveLength(1);
      expect(exercises[0].exercise_id).toBe("ex-1");
      expect(exercises[0].duration).toBe(60);
      expect(exercises[0].reps).toBeNull();
      expect(exercises[0].side).toBeNull();
      expect(exercises[0].order_index).toBe(0);
    });

    it("adds multiple exercises with correct order", () => {
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise);
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise2);
      const exercises = useClassBuilderStore.getState().blocks[0].exercises;
      expect(exercises).toHaveLength(2);
      expect(exercises[0].order_index).toBe(0);
      expect(exercises[1].order_index).toBe(1);
    });

    it("removes exercise from block and reindexes", () => {
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise);
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise2);
      const exId = useClassBuilderStore.getState().blocks[0].exercises[0].id;
      useClassBuilderStore.getState().removeExerciseFromBlock(blockId, exId);
      const exercises = useClassBuilderStore.getState().blocks[0].exercises;
      expect(exercises).toHaveLength(1);
      expect(exercises[0].order_index).toBe(0);
      expect(exercises[0].exercise_id).toBe("ex-2");
    });

    it("updates exercise properties", () => {
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise);
      const exId = useClassBuilderStore.getState().blocks[0].exercises[0].id;
      useClassBuilderStore.getState().updateBlockExercise(blockId, exId, {
        duration: 90,
        reps: 10,
        side: "left",
        notes: "Focus on form",
      });
      const ex = useClassBuilderStore.getState().blocks[0].exercises[0];
      expect(ex.duration).toBe(90);
      expect(ex.reps).toBe(10);
      expect(ex.side).toBe("left");
      expect(ex.notes).toBe("Focus on form");
    });

    it("reorders exercises in block", () => {
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise);
      useClassBuilderStore.getState().addExerciseToBlock(blockId, mockExercise2);
      useClassBuilderStore.getState().reorderExercisesInBlock(blockId, 0, 1);
      const exercises = useClassBuilderStore.getState().blocks[0].exercises;
      expect(exercises[0].exercise_id).toBe("ex-2");
      expect(exercises[1].exercise_id).toBe("ex-1");
      expect(exercises[0].order_index).toBe(0);
      expect(exercises[1].order_index).toBe(1);
    });
  });

  describe("browser filters", () => {
    it("sets browser search", () => {
      useClassBuilderStore.getState().setBrowserSearch("hundred");
      expect(useClassBuilderStore.getState().browserSearch).toBe("hundred");
    });

    it("sets browser method", () => {
      useClassBuilderStore.getState().setBrowserMethod("reformer");
      expect(useClassBuilderStore.getState().browserMethod).toBe("reformer");
    });

    it("sets browser category", () => {
      useClassBuilderStore.getState().setBrowserCategory("warmup");
      expect(useClassBuilderStore.getState().browserCategory).toBe("warmup");
    });

    it("sets browser difficulty", () => {
      useClassBuilderStore.getState().setBrowserDifficulty("advanced");
      expect(useClassBuilderStore.getState().browserDifficulty).toBe("advanced");
    });
  });

  describe("loadClass", () => {
    it("loads full class data", () => {
      const blocks: ClassBlock[] = [
        {
          id: "b1",
          class_id: "c1",
          name: "Warm Up",
          order_index: 0,
          exercises: [],
        },
      ];
      useClassBuilderStore.getState().loadClass({
        title: "Loaded Class",
        description: "From template",
        method: "reformer",
        classType: "private",
        difficulty: "advanced",
        durationMinutes: 45,
        playlistId: "pl-1",
        blocks,
      });
      const state = useClassBuilderStore.getState();
      expect(state.title).toBe("Loaded Class");
      expect(state.method).toBe("reformer");
      expect(state.blocks).toHaveLength(1);
      expect(state.selectedBlockId).toBe("b1");
      expect(state.selectedExerciseId).toBeNull();
    });

    it("handles empty blocks array", () => {
      useClassBuilderStore.getState().loadClass({
        title: "Empty",
        description: "",
        method: "mat",
        classType: "group",
        difficulty: "beginner",
        durationMinutes: 30,
        playlistId: null,
        blocks: [],
      });
      expect(useClassBuilderStore.getState().selectedBlockId).toBeNull();
    });
  });

  describe("totalDuration", () => {
    it("returns 0 for empty class", () => {
      expect(useClassBuilderStore.getState().totalDuration()).toBe(0);
    });

    it("sums exercise durations across blocks", () => {
      const store = useClassBuilderStore.getState();
      store.addBlock("A");
      const blockAId = useClassBuilderStore.getState().blocks[0].id;
      useClassBuilderStore.getState().addExerciseToBlock(blockAId, mockExercise); // 60s
      useClassBuilderStore.getState().addExerciseToBlock(blockAId, mockExercise2); // 45s

      useClassBuilderStore.getState().addBlock("B");
      const blockBId = useClassBuilderStore.getState().blocks[1].id;
      useClassBuilderStore.getState().addExerciseToBlock(blockBId, mockExercise); // 60s

      expect(useClassBuilderStore.getState().totalDuration()).toBe(165);
    });
  });

  describe("resetBuilder", () => {
    it("resets all state to defaults", () => {
      useClassBuilderStore.getState().setTitle("Test");
      useClassBuilderStore.getState().setMethod("reformer");
      useClassBuilderStore.getState().addBlock("Block");
      useClassBuilderStore.getState().resetBuilder();
      const state = useClassBuilderStore.getState();
      expect(state.title).toBe("");
      expect(state.method).toBe("mat");
      expect(state.blocks).toEqual([]);
      expect(state.durationMinutes).toBe(55);
    });
  });
});
