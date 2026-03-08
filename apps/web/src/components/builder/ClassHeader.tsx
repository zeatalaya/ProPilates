"use client";

import { useRouter } from "next/navigation";
import { Play, Save, Clock } from "lucide-react";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { useAuthStore } from "@/stores/auth";
import { formatDuration } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const METHODS = [
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "x-Reformer" },
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
            await supabase.from("block_exercises").insert({
              block_id: blk.id,
              exercise_id: ex.exercise_id,
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
    <div className="flex items-center gap-4 border-b border-border px-4 py-3">
      <input
        className="flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-text-muted"
        placeholder="Class Title..."
        value={store.title}
        onChange={(e) => store.setTitle(e.target.value)}
      />

      <select
        className="input-field w-auto"
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
        className="input-field w-auto"
        value={store.difficulty}
        onChange={(e) => store.setDifficulty(e.target.value as any)}
      >
        {DIFFICULTIES.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
        <Clock size={14} />
        {formatDuration(totalSec)}
      </div>

      <button
        className="btn-secondary text-sm"
        onClick={handleSave}
        disabled={!canSave || saving}
        title={!canSave ? "Premium required to save" : ""}
      >
        <Save size={14} />
        {saving ? "Saving..." : "Save"}
      </button>

      <button
        className="btn-primary text-sm"
        onClick={() => router.push("/teach")}
        disabled={store.blocks.length === 0}
      >
        <Play size={14} />
        Teach
      </button>
    </div>
  );
}
