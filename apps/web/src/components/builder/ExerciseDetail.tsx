"use client";

import { Clock, RotateCcw, MessageSquare, Target, Wrench, User, ArrowRight, Gauge, GraduationCap, Layers, Play } from "lucide-react";
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
    <div className="flex h-full flex-col">
      {/* Scrollable reference content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Exercise media */}
        {ex.image_url ? (
          <div className="mb-5 overflow-hidden rounded-lg">
            <img
              src={ex.image_url}
              alt={ex.name}
              className="h-48 w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-5 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-violet-900/20">
            <span className="text-3xl font-bold text-violet-400/60">
              {ex.name
                .split(" ")
                .map((w) => w[0])
                .filter((c) => c && c === c.toUpperCase())
                .slice(0, 3)
                .join("")}
            </span>
          </div>
        )}

        {ex.video_url && (
          <a
            href={ex.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
          >
            <Play size={14} />
            Watch exercise video
          </a>
        )}

        <div className="mb-5">
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

        <p className="mb-5 text-text-secondary">{ex.description}</p>

        {/* Objective */}
        {ex.objective && (
          <div className="mb-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Target size={14} /> Objective
            </h3>
            <p className="text-sm text-text-secondary">{ex.objective}</p>
          </div>
        )}

        {/* Apparatus */}
        {ex.apparatus && (
          <div className="mb-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-amber-400">
              <Wrench size={14} /> Apparatus
            </h3>
            <p className="text-sm text-text-secondary">{ex.apparatus}</p>
          </div>
        )}

        {/* Start Position */}
        {ex.start_position && (
          <div className="mb-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-sky-400">
              <User size={14} /> Start Position
            </h3>
            <p className="text-sm text-text-secondary">{ex.start_position}</p>
          </div>
        )}

        {/* Movement */}
        {ex.movement && ex.movement.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-violet-400">
              <ArrowRight size={14} /> Movement
            </h3>
            <ol className="space-y-1.5 pl-1">
              {ex.movement.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-text-secondary"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Pace & School badges */}
        {(ex.pace || ex.school) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {ex.pace && (
              <div className="flex items-center gap-1.5 rounded-full bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary">
                <Gauge size={12} className="text-orange-400" />
                {ex.pace.charAt(0).toUpperCase() + ex.pace.slice(1)}
              </div>
            )}
            {ex.school && (
              <div className="flex items-center gap-1.5 rounded-full bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary">
                <GraduationCap size={12} className="text-cyan-400" />
                {ex.school.charAt(0).toUpperCase() + ex.school.slice(1)}
              </div>
            )}
          </div>
        )}

        {/* Teaching Cues */}
        {ex.cues.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-rose-400">
              <MessageSquare size={14} /> Teaching Cues
            </h3>
            <ul className="space-y-1.5">
              {ex.cues.map((cue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                  {cue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sticky editable settings */}
      <div className="flex-shrink-0 border-t border-border bg-bg-primary p-4">
        <h3 className="mb-3 text-sm font-semibold text-text-secondary">Exercise Settings</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label-text mb-1 block text-[11px]">
              <Clock size={10} className="mr-1 inline" />
              Duration (s)
            </label>
            <input
              type="number"
              className="input-field text-sm"
              value={blockExercise.duration}
              onChange={(e) =>
                handleUpdate({ duration: parseInt(e.target.value) || 0 })
              }
              min={5}
              max={600}
            />
          </div>

          <div>
            <label className="label-text mb-1 block text-[11px]">
              <RotateCcw size={10} className="mr-1 inline" />
              Reps
            </label>
            <input
              type="number"
              className="input-field text-sm"
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
            <label className="label-text mb-1 block text-[11px]">Side</label>
            <select
              className="input-field text-sm"
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

          <div className="col-span-3">
            <label className="label-text mb-1 block text-[11px]">Notes</label>
            <textarea
              className="input-field min-h-[48px] resize-none text-sm"
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
