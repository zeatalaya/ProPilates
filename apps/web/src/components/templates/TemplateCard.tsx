"use client";

import { Clock, Layers, Dumbbell, Eye, Play } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PilatesClass } from "@/types";

const METHOD_GRADIENTS: Record<string, string> = {
  mat: "from-violet-600/20 to-violet-900/20",
  reformer: "from-blue-600/20 to-blue-900/20",
  "x-reformer": "from-emerald-600/20 to-emerald-900/20",
  chair: "from-amber-600/20 to-amber-900/20",
  tower: "from-rose-600/20 to-rose-900/20",
  barrel: "from-cyan-600/20 to-cyan-900/20",
};

const METHOD_BADGE: Record<string, "violet" | "blue" | "emerald" | "amber"> = {
  mat: "violet",
  reformer: "blue",
  "x-reformer": "emerald",
  chair: "amber",
  tower: "amber",
  barrel: "amber",
};

interface Props {
  template: PilatesClass;
  onPreview: (template: PilatesClass) => void;
  onUse: (template: PilatesClass) => void;
}

export function TemplateCard({ template, onPreview, onUse }: Props) {
  const blockCount = template.blocks?.length ?? 0;
  const exerciseCount =
    template.blocks?.reduce((sum, b) => sum + (b.exercises?.length ?? 0), 0) ?? 0;
  const gradient = METHOD_GRADIENTS[template.method] ?? METHOD_GRADIENTS.mat;
  const badgeVariant = METHOD_BADGE[template.method] ?? "violet";

  return (
    <Card className="overflow-hidden transition-all hover:border-violet-500/30">
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${gradient} px-4 py-5`}>
        <Badge variant={badgeVariant} className="mb-2">
          {template.method}
        </Badge>
        <h3 className="text-lg font-bold">{template.title}</h3>
        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
          {template.description}
        </p>
      </div>

      <CardBody>
        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {template.duration_minutes}min
          </div>
          <div className="flex items-center gap-1">
            <Layers size={14} />
            {blockCount} blocks
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell size={14} />
            {exerciseCount} exercises
          </div>
        </div>

        {/* Difficulty badge */}
        <div className="mt-2">
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

        {/* Action buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onPreview(template)}
            className="btn-secondary flex flex-1 items-center justify-center gap-1.5 text-sm"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => onUse(template)}
            className="btn-primary flex flex-1 items-center justify-center gap-1.5 text-sm"
          >
            <Play size={14} />
            Use Template
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
