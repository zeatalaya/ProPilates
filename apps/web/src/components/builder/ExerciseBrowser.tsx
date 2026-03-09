"use client";

import { useMemo } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { Badge } from "@/components/ui/Badge";
import type { Exercise, PilatesMethod, Difficulty } from "@/types";

interface Props {
  exercises: Exercise[];
  isLoading: boolean;
}

const METHODS: { value: PilatesMethod | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "x-Reformer" },
];

const DIFFICULTIES: { value: Difficulty | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const CATEGORIES = [
  "",
  "warmup",
  "strength",
  "flexibility",
  "balance",
  "cooldown",
  "flow",
  "cardio",
];

export function ExerciseBrowser({ exercises, isLoading }: Props) {
  const {
    browserSearch,
    browserMethod,
    browserCategory,
    browserDifficulty,
    setBrowserSearch,
    setBrowserMethod,
    setBrowserCategory,
    setBrowserDifficulty,
    selectedBlockId,
    addExerciseToBlock,
  } = useClassBuilderStore();

  const filtered = useMemo(() => {
    const query = browserSearch.toLowerCase();
    return exercises.filter((ex) => {
      if (browserMethod !== "all" && ex.method !== browserMethod) return false;
      if (browserCategory && ex.category !== browserCategory) return false;
      if (browserDifficulty && ex.difficulty !== browserDifficulty) return false;
      if (query) {
        const searchable = [
          ex.name,
          ex.description,
          ...(ex.cues || []),
          ex.objective || "",
          ex.school || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }, [exercises, browserSearch, browserMethod, browserCategory, browserDifficulty]);

  function handleAdd(exercise: Exercise) {
    if (!selectedBlockId) return;
    addExerciseToBlock(selectedBlockId, exercise);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-3">
        <h3 className="section-title">Exercises</h3>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search name, cues, objective..."
            value={browserSearch}
            onChange={(e) => setBrowserSearch(e.target.value)}
          />
        </div>

        {/* Method filter */}
        <div className="flex flex-wrap gap-1">
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setBrowserMethod(m.value)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                browserMethod === m.value
                  ? "bg-violet-600 text-white"
                  : "bg-bg-elevated text-text-muted hover:text-text-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap gap-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setBrowserDifficulty(d.value)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                browserDifficulty === d.value
                  ? d.value === "beginner"
                    ? "bg-emerald-600 text-white"
                    : d.value === "intermediate"
                      ? "bg-amber-600 text-white"
                      : d.value === "advanced"
                        ? "bg-violet-600 text-white"
                        : "bg-violet-600 text-white"
                  : "bg-bg-elevated text-text-muted hover:text-text-secondary"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          className="input-field text-sm"
          value={browserCategory}
          onChange={(e) => setBrowserCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-violet-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">
            No exercises found
          </div>
        ) : (
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs text-text-muted">
              {filtered.length} exercises
            </div>
            {filtered.map((ex) => (
              <div
                key={ex.id}
                className="group flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-bg-elevated"
              >
                {/* Exercise thumbnail */}
                {ex.image_url ? (
                  <img
                    src={ex.image_url}
                    alt={ex.name}
                    className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-violet-500/20 text-[10px] font-bold text-violet-400">
                    {ex.name
                      .split(" ")
                      .map((w) => w[0])
                      .filter((c) => c && c === c.toUpperCase())
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {ex.name}
                    </span>
                    <span
                      className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        ex.difficulty === "beginner"
                          ? "bg-emerald-400"
                          : ex.difficulty === "intermediate"
                            ? "bg-amber-400"
                            : "bg-violet-400"
                      }`}
                      title={ex.difficulty}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="gray" className="text-[10px] px-1.5 py-0">
                      {ex.method}
                    </Badge>
                    <Badge variant="gray" className="text-[10px] px-1.5 py-0">
                      {ex.category}
                    </Badge>
                    <span className="text-[10px] text-text-muted">
                      {ex.default_duration}s
                    </span>
                  </div>
                  {ex.objective && (
                    <p className="mt-0.5 truncate text-[11px] text-text-muted">
                      {ex.objective}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAdd(ex)}
                  disabled={!selectedBlockId}
                  className="mt-1 flex-shrink-0 rounded p-1 text-text-muted opacity-0 transition-all hover:bg-violet-500/20 hover:text-violet-400 group-hover:opacity-100 disabled:cursor-not-allowed"
                  title={
                    selectedBlockId
                      ? "Add to selected block"
                      : "Select a block first"
                  }
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
