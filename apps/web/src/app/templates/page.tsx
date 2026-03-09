"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDetailModal } from "@/components/templates/TemplateDetailModal";
import type { PilatesClass, PilatesMethod, Difficulty, ClassBlock, BlockExercise } from "@/types";

const METHODS: { value: PilatesMethod | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "xR" },
];

const DIFFICULTIES: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const loadClass = useClassBuilderStore((s) => s.loadClass);
  const [templates, setTemplates] = useState<PilatesClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<PilatesMethod | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [previewTemplate, setPreviewTemplate] = useState<PilatesClass | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      // Fetch template classes with their blocks and exercises
      const { data } = await supabase
        .from("classes")
        .select(
          `
          *,
          class_blocks (
            *,
            block_exercises (
              *,
              exercise:exercises (*)
            )
          )
        `,
        )
        .eq("is_template", true)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: PilatesClass[] = data.map((cls: any) => ({
          ...cls,
          blocks: (cls.class_blocks ?? [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((blk: any) => ({
              ...blk,
              exercises: (blk.block_exercises ?? [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((bex: any) => ({
                  ...bex,
                  exercise: bex.exercise,
                })),
            })),
        }));
        setTemplates(mapped);
      }
      setIsLoading(false);
    }
    loadTemplates();
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (methodFilter !== "all" && t.method !== methodFilter) return false;
      if (difficultyFilter !== "all" && t.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [templates, methodFilter, difficultyFilter]);

  function handleUseTemplate(template: PilatesClass) {
    // Generate new local IDs for blocks/exercises so the builder works correctly
    const blocks: ClassBlock[] = (template.blocks ?? []).map((blk) => ({
      id: crypto.randomUUID(),
      class_id: "",
      name: blk.name,
      order_index: blk.order_index,
      exercises: (blk.exercises ?? []).map((bex: BlockExercise) => ({
        id: crypto.randomUUID(),
        block_id: "",
        exercise_id: bex.exercise_id,
        exercise: bex.exercise,
        order_index: bex.order_index,
        duration: bex.duration,
        reps: bex.reps,
        side: bex.side,
        notes: bex.notes,
      })),
    }));

    loadClass({
      title: template.title,
      description: template.description,
      method: template.method,
      classType: template.class_type,
      difficulty: template.difficulty,
      durationMinutes: template.duration_minutes,
      playlistId: template.playlist_id,
      blocks,
    });

    router.push("/builder");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Class Templates</h1>
        <p className="mt-2 text-text-secondary">
          Pre-built class plans ready to teach or customize. Load any template
          into the builder and make it your own.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Method filter */}
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMethodFilter(m.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                methodFilter === m.value
                  ? "bg-violet-600 text-white"
                  : "bg-bg-elevated text-text-muted hover:text-text-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficultyFilter(d.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                difficultyFilter === d.value
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
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <BookOpen
            size={48}
            className="mx-auto mb-4 text-text-muted opacity-30"
          />
          <p className="text-text-muted">
            {templates.length === 0
              ? "No templates available yet. Run the seed script to populate templates."
              : "No templates match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onPreview={setPreviewTemplate}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <TemplateDetailModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={(t) => {
            setPreviewTemplate(null);
            handleUseTemplate(t);
          }}
        />
      )}
    </div>
  );
}
