"use client";

import type { OnboardingData } from "@/app/onboarding/page";
import type { PilatesMethod, ClassType } from "@/types";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const METHODS: { value: PilatesMethod; label: string }[] = [
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "chair", label: "Chair" },
  { value: "tower", label: "Tower / Cadillac" },
  { value: "barrel", label: "Barrel" },
  { value: "ring", label: "Magic Circle" },
  { value: "band", label: "Resistance Band" },
  { value: "foam_roller", label: "Foam Roller" },
];

const CLASS_TYPES: { value: ClassType; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "duet", label: "Duet" },
  { value: "group", label: "Group" },
  { value: "virtual", label: "Virtual" },
];

const EQUIPMENT = [
  "Reformer", "Cadillac", "Wunda Chair", "Ladder Barrel",
  "Spine Corrector", "Magic Circle", "Resistance Band", "Foam Roller",
  "Stability Ball", "TRX", "Jumpboard", "Rotation Disk",
];

const CERTIFICATIONS = [
  "BASI Pilates", "STOTT Pilates", "Balanced Body", "Polestar Pilates",
  "Peak Pilates", "Power Pilates", "Fletcher Pilates", "Romana\'s Pilates",
  "PhysicalMind Institute", "Core Pilates NYC", "Club Pilates Training",
  "ACE Pilates", "NASM Pilates",
];

function ToggleGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <label className="label-text mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              selected.includes(value)
                ? "border-violet-500 bg-violet-500/15 text-violet-400"
                : "border-border text-text-secondary hover:border-border-hover"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepPractice({ data, updateData, onNext, onPrev }: Props) {
  function toggleInArray<T extends string>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Practice</h2>
        <p className="text-text-secondary">
          What methods and equipment do you teach with?
        </p>
      </div>

      <div className="space-y-6">
        <ToggleGroup
          label="Methods *"
          options={METHODS}
          selected={data.methods}
          onToggle={(v) =>
            updateData({
              methods: toggleInArray(data.methods, v as PilatesMethod),
            })
          }
        />

        <ToggleGroup
          label="Class Types"
          options={CLASS_TYPES}
          selected={data.classTypes}
          onToggle={(v) =>
            updateData({
              classTypes: toggleInArray(data.classTypes, v as ClassType),
            })
          }
        />

        <ToggleGroup
          label="Equipment"
          options={EQUIPMENT.map((e) => ({ value: e, label: e }))}
          selected={data.equipment}
          onToggle={(v) =>
            updateData({ equipment: toggleInArray(data.equipment, v) })
          }
        />

        <ToggleGroup
          label="Certifications"
          options={CERTIFICATIONS.map((c) => ({ value: c, label: c }))}
          selected={data.certifications}
          onToggle={(v) =>
            updateData({
              certifications: toggleInArray(data.certifications, v),
            })
          }
        />
      </div>

      <div className="flex justify-between pt-4">
        <button className="btn-ghost" onClick={onPrev}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={data.methods.length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
