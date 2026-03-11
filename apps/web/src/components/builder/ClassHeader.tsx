"use client";

import { useRouter } from "next/navigation";
import { Play, Save, Clock, BookOpen } from "lucide-react";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { useAuthStore } from "@/stores/auth";
import { formatDuration } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const METHODS = [
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "x-Reformer" },
  { value: "chair", label: "Chair" },
  { value: "tower", label: "Tower" },
  { value: "barrel", label: "Barrel" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function ClassHeader() {
  const router = useRouter();
  const { tier, instructor } = useAuthStore();
  const store = useClassBuilderStore();
  const [saving, setSaving] = useState(false);

  const totalSec = store.totalDuration();
  const canSave = tier === "premium" && instructor;

  async function handleSave() {
    if (!canSave || !instructor) return;
    setSaving(true);
    try {
      // First: persist any temp custom exercises to Supabase
      const tempExerciseIdMap = new Map<string, string>();
      for (const block of store.blocks) {
        for (const ex of block.exercises) {
          if (ex.exercise_id.startsWith("temp-") && ex.exercise) {
            // Save custom exercise to DB
            const { data: saved } = await supabase
              .from("exercises")
              .insert({
                name: ex.exercise.name,
                method: ex.exercise.method,
                category: ex.exercise.category,
                difficulty: ex.exercise.difficulty,
                muscle_groups: ex.exercise.muscle_groups,
                description: ex.exercise.description,
                cues: ex.exercise.cues,
                default_duration: ex.exercise.default_duration,
                objective: ex.exercise.objective,
                apparatus: ex.exercise.apparatus,
                start_position: ex.exercise.start_position,
                movement: ex.exercise.movement,
                pace: ex.exercise.pace,
                school: ex.exercise.school,
                creator_id: instructor.id,
                is_custom: true,
                is_public: false,
              })
              .select()
              .single();
            if (saved) {
              tempExerciseIdMap.set(ex.exercise_id, saved.id);
            }
          }
        }
      }

      // Create class
      const { data: cls, error } = await supabase
        .from("classes")
        .insert({
          instructor_id: instructor.id,
          title: store.title || "Untitled Class",
          description: store.description,
          method: store.method,
          class_type: store.classType,
          difficulty: store.difficulty,
          duration_minutes: Math.ceil(totalSec / 60),
        })
        .select()
        .single();

      if (error || !cls) throw error;

      // Create blocks and exercises
      for (const block of store.blocks) {
        const { data: blk } = await supabase
          .from("class_blocks")
          .insert({
            class_id: cls.id,
            name: block.name,
            order_index: block.order_index,
          })
          .select()
          .single();

        if (blk) {
          for (const ex of block.exercises) {
            const resolvedExerciseId =
              tempExerciseIdMap.get(ex.exercise_id) || ex.exercise_id;
            await supabase.from("block_exercises").insert({
              block_id: blk.id,
              exercise_id: resolvedExerciseId,
              order_index: ex.order_index,
              duration: ex.duration,
              reps: ex.reps,
              side: ex.side,
              notes: ex.notes,
            });
          }
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-border px-3 md:px-4 py-2 md:py-3">
      {/* Row 1: Title + selectors */}
      <div className="flex items-center gap-2 md:gap-4">
        <input
          className="min-w-0 flex-1 bg-transparent text-base md:text-lg font-semibold outline-none placeholder:text-text-muted"
          placeholder="Class Title..."
          value={store.title}
          onChange={(e) => store.setTitle(e.target.value)}
        />

        <select
          className="input-field w-auto text-sm"
          value={store.method}
          onChange={(e) => store.setMethod(e.target.value as any)}
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          className="hidden sm:block input-field w-auto text-sm"
          value={store.difficulty}
          onChange={(e) => store.setDifficulty(e.target.value as any)}
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <div className="hidden md:flex items-center gap-1.5 text-sm text-text-secondary">
          <Clock size={14} />
          {formatDuration(totalSec)}
        </div>

        <button
          className="hidden lg:inline-flex btn-secondary text-sm"
          onClick={() => router.push("/templates")}
        >
          <BookOpen size={14} />
          Templates
        </button>

        <button
          className="hidden sm:inline-flex btn-secondary text-sm"
          onClick={handleSave}
          disabled={!canSave || saving}
          title={!canSave ? "Premium required to save" : ""}
        >
          <Save size={14} />
          <span className="hidden md:inline">{saving ? "Saving..." : "Save"}</span>
        </button>

        <button
          className="btn-primary text-sm"
          onClick={() => router.push("/teach")}
          disabled={store.blocks.length === 0}
        >
          <Play size={14} />
          <span className="hidden sm:inline">Teach</span>
        </button>
      </div>
    </div>
  );
}
