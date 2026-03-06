"use client";

import { useState } from "react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MUSIC_STYLES = [
  "Ambient / Chill",
  "Lo-fi Beats",
  "Acoustic",
  "Classical",
  "Electronic",
  "Jazz",
  "World Music",
  "Pop",
  "R&B / Soul",
  "Instrumental",
  "No Music",
];

export function StepMusic({ data, updateData, onNext, onPrev }: Props) {
  const [artistInput, setArtistInput] = useState("");

  function addArtist() {
    const trimmed = artistInput.trim();
    if (trimmed && !data.favoriteArtists.includes(trimmed)) {
      updateData({ favoriteArtists: [...data.favoriteArtists, trimmed] });
    }
    setArtistInput("");
  }

  function removeArtist(artist: string) {
    updateData({
      favoriteArtists: data.favoriteArtists.filter((a) => a !== artist),
    });
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Music Preferences</h2>
        <p className="text-text-secondary">
          What soundtrack do you prefer for teaching?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="label-text mb-2 block">Preferred Style</label>
          <div className="flex flex-wrap gap-2">
            {MUSIC_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => updateData({ musicStyle: style })}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  data.musicStyle === style
                    ? "border-violet-500 bg-violet-500/15 text-violet-400"
                    : "border-border text-text-secondary hover:border-border-hover"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text mb-2 block">Favorite Artists</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {data.favoriteArtists.map((artist) => (
              <span
                key={artist}
                className="badge-violet cursor-pointer"
                onClick={() => removeArtist(artist)}
              >
                {artist} &times;
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Add an artist..."
              value={artistInput}
              onChange={(e) => setArtistInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addArtist()}
            />
            <button className="btn-secondary" onClick={addArtist}>
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button className="btn-ghost" onClick={onPrev}>
          Back
        </button>
        <button className="btn-primary" onClick={onNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
