"use client";

import { useState } from "react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Japanese", "Mandarin", "Korean", "Arabic", "Hindi", "Dutch",
];

export function StepPersonal({ data, updateData, onNext }: Props) {
  const [langInput, setLangInput] = useState("");

  const canNext = data.name.trim().length > 0 && data.location.trim().length > 0;

  function addLanguage(lang: string) {
    if (!data.languages.includes(lang)) {
      updateData({ languages: [...data.languages, lang] });
    }
    setLangInput("");
  }

  function removeLanguage(lang: string) {
    updateData({ languages: data.languages.filter((l) => l !== lang) });
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-text-secondary">
          Let&apos;s start with some basic info.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-text mb-1.5 block">Name *</label>
          <input
            className="input-field"
            placeholder="Your full name"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text mb-1.5 block">Bio</label>
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="Tell clients about your teaching style and experience..."
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text mb-1.5 block">Location *</label>
          <input
            className="input-field"
            placeholder="City, Country"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text mb-1.5 block">Languages</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <span
                key={lang}
                className="badge-violet cursor-pointer"
                onClick={() => removeLanguage(lang)}
              >
                {lang} &times;
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.filter((l) => !data.languages.includes(l)).map(
              (lang) => (
                <button
                  key={lang}
                  onClick={() => addLanguage(lang)}
                  className="rounded-lg border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-violet-500 hover:text-violet-400"
                >
                  + {lang}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="btn-primary" onClick={onNext} disabled={!canNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
