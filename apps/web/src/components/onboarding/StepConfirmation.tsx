"use client";

import { CheckCircle, Loader2, Music } from "lucide-react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[] | string;
}) {
  const display = Array.isArray(items) ? items.join(", ") : items;
  if (!display) return null;
  return (
    <div>
      <div className="text-sm text-text-muted">{title}</div>
      <div className="text-text-primary">{display}</div>
    </div>
  );
}

export function StepConfirmation({
  data,
  onPrev,
  onComplete,
  isSubmitting,
}: Props) {
  const location = [data.city, data.country].filter(Boolean).join(", ");

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Confirm Your Profile</h2>
        <p className="text-text-secondary">
          Review your information before creating your profile.
        </p>
      </div>

      <div className="glass-card divide-y divide-border">
        <div className="space-y-3 p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <CheckCircle size={16} className="text-violet-400" /> Personal
          </h3>
          <Section title="Name" items={data.name} />
          <Section title="Bio" items={data.bio} />
          <Section title="Location" items={location} />
          <Section title="Languages" items={data.languages} />
        </div>

        <div className="space-y-3 p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <CheckCircle size={16} className="text-violet-400" /> Practice
          </h3>
          <Section title="Methods" items={data.methods} />
          <Section title="Class Types" items={data.classTypes} />
        </div>

        <div className="space-y-3 p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <CheckCircle size={16} className="text-violet-400" /> Music
          </h3>
          <Section title="Genres" items={data.musicGenres} />
          {data.spotifyConnected && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Music size={16} />
              Spotify Connected
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button className="btn-ghost" onClick={onPrev}>
          Back
        </button>
        <button
          className="btn-primary"
          onClick={onComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating...
            </>
          ) : (
            "Create Profile"
          )}
        </button>
      </div>
    </div>
  );
}
