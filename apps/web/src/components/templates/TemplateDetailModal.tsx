"use client";

import { X, Clock, Layers, Dumbbell, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { PilatesClass } from "@/types";

interface Props {
  template: PilatesClass;
  onClose: () => void;
  onUse: (template: PilatesClass) => void;
}

export function TemplateDetailModal({ template, onClose, onUse }: Props) {
  const exerciseCount =
    template.blocks?.reduce((sum, b) => sum + (b.exercises?.length ?? 0), 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-bg-primary shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  template.method === "reformer"
                    ? "blue"
                    : template.method === "x-reformer"
                      ? "emerald"
                      : "violet"
                }
              >
                {template.method}
              </Badge>
              <Badge
                variant={
                  template.difficulty === "beginner"
                    ? "emerald"
                    : template.difficulty === "intermediate"
                      ? "amber"
                      : "violet"
                }
              >
                {template.difficulty}
              </Badge>
            </div>
            <h2 className="text-xl font-bold">{template.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 border-b border-border px-5 py-3 text-sm text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            {template.duration_minutes} min
          </div>
          <div className="flex items-center gap-1.5">
            <Layers size={14} />
            {template.blocks?.length ?? 0} blocks
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell size={14} />
            {exerciseCount} exercises
          </div>
        </div>

        {/* Blocks & exercises */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {template.blocks?.map((block, bi) => (
              <div key={block.id || bi}>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">
                  {block.name}
                </h3>
                <div className="space-y-1.5">
                  {block.exercises?.map((bex, ei) => {
                    const ex = bex.exercise;
                    return (
                      <div
                        key={bex.id || ei}
                        className="flex items-center gap-3 rounded-lg bg-bg-elevated px-3 py-2"
                      >
                        {/* Exercise image or placeholder */}
                        {ex?.image_url ? (
                          <img
                            src={ex.image_url}
                            alt={ex.name}
                            className="h-8 w-8 flex-shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-violet-500/20 text-xs font-bold text-violet-400">
                            {(ex?.name ?? bex.exercise_id)
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium">
                              {ex?.name ?? "Exercise"}
                            </span>
                            {ex && (
                              <span
                                className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                  ex.difficulty === "beginner"
                                    ? "bg-emerald-400"
                                    : ex.difficulty === "intermediate"
                                      ? "bg-amber-400"
                                      : "bg-violet-400"
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        <span className="flex-shrink-0 text-xs text-text-muted">
                          {bex.duration}s
                          {bex.reps ? ` / ${bex.reps} reps` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border p-4">
          <button onClick={onClose} className="btn-secondary text-sm">
            Close
          </button>
          <button
            onClick={() => onUse(template)}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Play size={14} />
            Load into Builder
          </button>
        </div>
      </div>
    </div>
  );
}
