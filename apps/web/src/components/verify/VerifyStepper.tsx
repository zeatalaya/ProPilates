"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerifyStep } from "@/stores/verify";

interface Step {
  key: VerifyStep;
  label: string;
  icon: LucideIcon;
}

interface VerifyStepperProps {
  currentStep: VerifyStep;
  steps: Step[];
}

const STEP_ORDER: VerifyStep[] = [
  "connecting",
  "choosing",
  "proving",
  "submitting",
  "success",
];

function getStepIndex(step: VerifyStep): number {
  const idx = STEP_ORDER.indexOf(step);
  return idx === -1 ? 0 : idx;
}

export function VerifyStepper({ currentStep, steps }: VerifyStepperProps) {
  const currentIdx = getStepIndex(currentStep === "error" ? "submitting" : currentStep);

  return (
    <div className="mb-10 flex items-center justify-between">
      {steps.map((step, i) => {
        const stepIdx = getStepIndex(step.key);
        const isCompleted = stepIdx < currentIdx;
        const isActive = stepIdx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted &&
                    "border-emerald-500 bg-emerald-500 text-white",
                  isActive &&
                    "border-violet-500 bg-violet-600 text-white",
                  !isCompleted &&
                    !isActive &&
                    "border-border bg-bg-elevated text-text-muted",
                )}
              >
                <Icon size={18} />
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCompleted && "text-emerald-400",
                  isActive && "text-violet-400",
                  !isCompleted && !isActive && "text-text-muted",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 flex-1",
                  stepIdx < currentIdx
                    ? "bg-emerald-500"
                    : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
