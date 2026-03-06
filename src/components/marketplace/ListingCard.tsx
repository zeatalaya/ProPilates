"use client";

import { Clock, User, Zap } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatXion } from "@/lib/utils";
import type { PilatesClass, Instructor } from "@/types";

interface Props {
  pilatesClass: PilatesClass;
  instructor: Instructor;
  onPurchase?: () => void;
}

export function MarketplaceListingCard({
  pilatesClass,
  instructor,
  onPurchase,
}: Props) {
  return (
    <Card className="overflow-hidden transition-all hover:border-violet-500/30">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-violet-600/20 to-violet-900/20 px-4 py-6">
        <Badge variant="violet" className="mb-3">
          {pilatesClass.method}
        </Badge>
        <h3 className="text-lg font-bold">{pilatesClass.title}</h3>
        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
          {pilatesClass.description}
        </p>
      </div>

      <CardBody>
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {pilatesClass.duration_minutes}min
          </div>
          <Badge
            variant={
              pilatesClass.difficulty === "beginner"
                ? "emerald"
                : pilatesClass.difficulty === "intermediate"
                  ? "amber"
                  : "violet"
            }
          >
            {pilatesClass.difficulty}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <User size={14} className="text-text-muted" />
          <span className="text-text-secondary">{instructor.name}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-violet-400" />
            <span className="text-lg font-bold">
              {pilatesClass.price != null
                ? `${formatXion(pilatesClass.price)} XION`
                : "Free"}
            </span>
          </div>

          <button className="btn-primary text-sm" onClick={onPurchase}>
            Purchase
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
