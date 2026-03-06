"use client";

import { Clock, RotateCcw, MessageSquare } from "lucide-react";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { BlockExercise } from "@/types";

interface Props {
  blockExercise: BlockExercise | null | undefined;
}

export function ExerciseDetail({ blockExercise }: Props) {
  const { selectedBlockId, updateBlockExercise } = useClassBuilderStore();

  if (!blockExercise || !blockExercise.exercise) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        <div className="text-center">
          <Layers size={48} className="mx-auto mb-4 opacity-30" />
          <p>Select an exercise from a block to view details</p>
        </div>
      </div>
    );
  }

  const ex = blockExercise.exercise;

  function handleUpdate(updates: Partial<BlockExercise>) {
    if (!selectedBlockId || !blockExercise) return;
    updateBlockExercise(selectedBlockId, blockExercise.id, updates);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold">{ex.name}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="violet">{ex.method}</Badge>
          <Badge variant="blue">{ex.category}</Badge>
          <Badge
            variant={
              ex.difficulty === "beginner"
                ? "emerald"
                : ex.difficulty === "intermediate"
                  ? "amber"
                  : "violet"
            }
          >
            {ex.difficulty}
          </Badge>
          {ex.muscle_groups.map((mg) => (
            <Badge key={mg} variant="gray">
              {mg}
            </Badge>
          ))}
        </div>
      </div>

      <p className="mb-6 text-text-secondary">{ex.description}</p>

      {/* Cues */}
      {ex.cues.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 flex items-center gap-2 font-semibold">
            <MessageSquare size={16} className="text-violet-400" /> Teaching
            Cues
          </h3>
          <ul className="space-y-1.5">
            {ex.cues.map((cue, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                {cue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editable fields */}
      <div className="glass-card p-4">
        <h3 className="mb-4 font-semibold">Exercise Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text mb-1 block">
              <Clock size={12} className="mr-1 inline" />
              Duration (seconds)
            </label>
            <input
              type="number"
              className="input-field"
              value={blockExercise.duration}
              onChange={(e) =>
                handleUpdate({ duration: parseInt(e.target.value) || 0 })
              }
              min={5}
              max={600}
            />
          </div>

          <div>
            <label className="label-text mb-1 block">
              <RotateCcw size={12} className="mr-1 inline" />
              Reps (optional)
            </label>
            <input
              type="number"
              className="input-field"
              value={blockExercise.reps ?? ""}
              onChange={(e) =>
                handleUpdate({
                  reps: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              min={1}
              max={100}
            />
          </div>

          <div>
            <label className="label-text mb-1 block">Side</label>
            <select
              className="input-field"
              value={blockExercise.side ?? ""}
              onChange={(e) =>
                handleUpdate({
                  side: (e.target.value || null) as any,
                })
              }
            >
              <option value="">Both / N/A</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="both">Both sides</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="label-text mb-1 block">Notes</label>
            <textarea
              className="input-field min-h-[60px] resize-none text-sm"
              placeholder="Personal teaching notes..."
              value={blockExercise.notes}
              onChange={(e) => handleUpdate({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Needed for the empty state icon
import { Layers } from "lucide-react";
