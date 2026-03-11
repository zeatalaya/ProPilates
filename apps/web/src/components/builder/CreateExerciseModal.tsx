"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import type {
  Exercise,
  PilatesMethod,
  ExerciseCategory,
  Difficulty,
  MuscleGroup,
  ExercisePace,
  PilatesSchool,
} from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (exercise: Exercise) => void;
  isPremium: boolean;
}

const METHODS: PilatesMethod[] = [
  "mat", "reformer", "x-reformer", "chair", "tower", "barrel", "ring", "band", "foam_roller",
];

const CATEGORIES: ExerciseCategory[] = [
  "warmup", "strength", "flexibility", "balance", "cooldown", "flow", "cardio",
];

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

const MUSCLE_GROUPS: MuscleGroup[] = [
  "core", "legs", "arms", "back", "glutes", "shoulders", "full_body", "hip_flexors", "chest",
];

const PACES: ExercisePace[] = ["deliberate", "moderate", "flowing", "dynamic"];

const SCHOOLS: PilatesSchool[] = [
  "classical", "basi", "stott", "romana", "fletcher", "polestar", "balanced_body", "contemporary",
];

export function CreateExerciseModal({ open, onClose, onCreated, isPremium }: Props) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState<PilatesMethod>("mat");
  const [category, setCategory] = useState<ExerciseCategory>("strength");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(["core"]);
  const [description, setDescription] = useState("");
  const [cues, setCues] = useState<string[]>([""]);
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [objective, setObjective] = useState("");
  const [apparatus, setApparatus] = useState("");
  const [startPosition, setStartPosition] = useState("");
  const [movement, setMovement] = useState<string[]>([""]);
  const [pace, setPace] = useState<ExercisePace | "">("");
  const [school, setSchool] = useState<PilatesSchool | "">("");

  if (!open) return null;

  function toggleMuscle(mg: MuscleGroup) {
    setMuscleGroups((prev) =>
      prev.includes(mg) ? prev.filter((m) => m !== mg) : [...prev, mg],
    );
  }

  function handleSubmit() {
    if (!name.trim()) return;

    const exercise: Exercise = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      method,
      category,
      difficulty,
      muscle_groups: muscleGroups,
      description: description.trim(),
      cues: cues.filter((c) => c.trim()),
      default_duration: defaultDuration,
      image_url: null,
      video_url: null,
      objective: objective.trim() || null,
      apparatus: apparatus.trim() || null,
      start_position: startPosition.trim() || null,
      movement: movement.filter((m) => m.trim()).length > 0 ? movement.filter((m) => m.trim()) : null,
      pace: pace || null,
      school: school || null,
      creator_id: null, // Set by the caller/save logic
      is_custom: true,
      is_public: false,
    };

    onCreated(exercise);
    resetForm();
    onClose();
  }

  function resetForm() {
    setName("");
    setMethod("mat");
    setCategory("strength");
    setDifficulty("beginner");
    setMuscleGroups(["core"]);
    setDescription("");
    setCues([""]);
    setDefaultDuration(30);
    setObjective("");
    setApparatus("");
    setStartPosition("");
    setMovement([""]);
    setPace("");
    setSchool("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-bg-card p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
        >
          <X size={18} />
        </button>

        <h2 className="mb-1 text-lg font-bold">Create Custom Exercise</h2>
        {!isPremium && (
          <p className="mb-4 text-xs text-amber-400">
            Free tier — exercise available this session only. Upgrade to premium to save permanently.
          </p>
        )}
        {isPremium && (
          <p className="mb-4 text-xs text-text-muted">
            Exercise will be saved to your library.
          </p>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Name *</label>
            <input
              className="input-field text-sm"
              placeholder="e.g. Single Leg Bridge"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Method + Category + Difficulty */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Method</label>
              <select className="input-field text-sm" value={method} onChange={(e) => setMethod(e.target.value as PilatesMethod)}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Category</label>
              <select className="input-field text-sm" value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Difficulty</label>
              <select className="input-field text-sm" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Muscle Groups */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Muscle Groups</label>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => toggleMuscle(mg)}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    muscleGroups.includes(mg)
                      ? "bg-violet-600 text-white"
                      : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {mg.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Description</label>
            <textarea
              className="input-field text-sm"
              rows={2}
              placeholder="Brief description of the exercise..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Default Duration (seconds)</label>
            <input
              type="number"
              className="input-field w-24 text-sm"
              min={5}
              max={600}
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(Number(e.target.value) || 30)}
            />
          </div>

          {/* Teaching Cues */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Teaching Cues</label>
            {cues.map((cue, i) => (
              <div key={i} className="mb-1 flex gap-1">
                <input
                  className="input-field flex-1 text-sm"
                  placeholder={`Cue ${i + 1}`}
                  value={cue}
                  onChange={(e) => {
                    const next = [...cues];
                    next[i] = e.target.value;
                    setCues(next);
                  }}
                />
                {cues.length > 1 && (
                  <button type="button" onClick={() => setCues(cues.filter((_, j) => j !== i))} className="p-1 text-text-muted hover:text-red-400">
                    <Minus size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setCues([...cues, ""])} className="mt-1 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              <Plus size={12} /> Add cue
            </button>
          </div>

          {/* Optional: Objective */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Objective (optional)</label>
            <input className="input-field text-sm" placeholder="Learning goal..." value={objective} onChange={(e) => setObjective(e.target.value)} />
          </div>

          {/* Optional: Start Position */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Start Position (optional)</label>
            <input className="input-field text-sm" placeholder="e.g. Supine, knees bent..." value={startPosition} onChange={(e) => setStartPosition(e.target.value)} />
          </div>

          {/* Optional: Movement Steps */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Movement Steps (optional)</label>
            {movement.map((step, i) => (
              <div key={i} className="mb-1 flex gap-1">
                <span className="mt-2 text-xs text-text-muted">{i + 1}.</span>
                <input
                  className="input-field flex-1 text-sm"
                  placeholder={`Step ${i + 1}`}
                  value={step}
                  onChange={(e) => {
                    const next = [...movement];
                    next[i] = e.target.value;
                    setMovement(next);
                  }}
                />
                {movement.length > 1 && (
                  <button type="button" onClick={() => setMovement(movement.filter((_, j) => j !== i))} className="p-1 text-text-muted hover:text-red-400">
                    <Minus size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setMovement([...movement, ""])} className="mt-1 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              <Plus size={12} /> Add step
            </button>
          </div>

          {/* Optional: Pace + School */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Pace</label>
              <select className="input-field text-sm" value={pace} onChange={(e) => setPace(e.target.value as ExercisePace | "")}>
                <option value="">None</option>
                {PACES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">School</label>
              <select className="input-field text-sm" value={school} onChange={(e) => setSchool(e.target.value as PilatesSchool | "")}>
                <option value="">None</option>
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Apparatus */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Apparatus / Equipment (optional)</label>
            <input className="input-field text-sm" placeholder="e.g. Reformer with box" value={apparatus} onChange={(e) => setApparatus(e.target.value)} />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {isPremium ? "Create & Save" : "Add to Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
