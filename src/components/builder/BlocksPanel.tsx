"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { cn, formatDuration } from "@/lib/utils";

export function BlocksPanel() {
  const {
    blocks,
    selectedBlockId,
    selectBlock,
    addBlock,
    removeBlock,
    renameBlock,
    selectExercise,
  } = useClassBuilderStore();

  const [newBlockName, setNewBlockName] = useState("");

  function handleAddBlock() {
    const name = newBlockName.trim() || `Block ${blocks.length + 1}`;
    addBlock(name);
    setNewBlockName("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <h3 className="section-title mb-3">Blocks</h3>
        <div className="flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Block name..."
            value={newBlockName}
            onChange={(e) => setNewBlockName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBlock()}
          />
          <button className="btn-primary px-2.5 py-2" onClick={handleAddBlock}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-muted">
            Add a block to start building your class
          </div>
        ) : (
          <div className="space-y-1">
            {blocks.map((block) => {
              const blockDuration = block.exercises.reduce(
                (s, e) => s + e.duration,
                0,
              );
              return (
                <div
                  key={block.id}
                  className={cn(
                    "group rounded-lg border p-3 transition-all cursor-pointer",
                    selectedBlockId === block.id
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-transparent hover:bg-bg-elevated",
                  )}
                  onClick={() => selectBlock(block.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical
                        size={14}
                        className="text-text-muted"
                      />
                      <input
                        className="bg-transparent text-sm font-medium outline-none"
                        value={block.name}
                        onChange={(e) =>
                          renameBlock(block.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <button
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(block.id);
                      }}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                    <span>{block.exercises.length} exercises</span>
                    <span>&middot;</span>
                    <span>{formatDuration(blockDuration)}</span>
                  </div>

                  {/* Exercise list within block */}
                  {selectedBlockId === block.id && (
                    <div className="mt-2 space-y-1">
                      {block.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className={cn(
                            "rounded px-2 py-1 text-xs transition-colors cursor-pointer",
                            ex.id ===
                              useClassBuilderStore.getState()
                                .selectedExerciseId
                              ? "bg-violet-500/20 text-violet-300"
                              : "text-text-secondary hover:bg-bg-elevated",
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectExercise(ex.id);
                          }}
                        >
                          {ex.exercise?.name ?? "Exercise"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
