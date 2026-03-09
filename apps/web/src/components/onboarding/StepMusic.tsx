"use client";

import { Music, ExternalLink, CheckCircle } from "lucide-react";
import type { OnboardingData } from "@/app/onboarding/page";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MUSIC_GENRES = [
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
  "Techno",
  "House",
  "Deep House",
  "Afro House",
  "Minimal",
  "Drum & Bass",
  "Downtempo",
  "Trip Hop",
  "Indie",
  "Folk",
  "Latin",
  "Reggaeton",
  "Funk",
  "No Music",
];

export function StepMusic({ data, updateData, onNext, onPrev }: Props) {
  function toggleGenre(genre: string) {
    if (genre === "No Music") {
      // If selecting "No Music", clear all others
      if (data.musicGenres.includes("No Music")) {
        updateData({ musicGenres: [] });
      } else {
        updateData({ musicGenres: ["No Music"] });
      }
      return;
    }

    // If selecting a genre, remove "No Music" if present
    const withoutNoMusic = data.musicGenres.filter((g) => g !== "No Music");
    if (withoutNoMusic.includes(genre)) {
      updateData({ musicGenres: withoutNoMusic.filter((g) => g !== genre) });
    } else {
      updateData({ musicGenres: [...withoutNoMusic, genre] });
    }
  }

  function handleConnectSpotify() {
    // Navigate to Spotify OAuth with state=onboarding so callback redirects back here
    window.location.href = "/api/auth/spotify?from=onboarding";
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Music Preferences</h2>
        <p className="text-text-secondary">
          What soundtrack do you prefer for teaching? Select all that apply.
        </p>
      </div>

      <div className="space-y-6">
        {/* Genre multi-select */}
        <div>
          <label className="label-text mb-2 block">Preferred Genres</label>
          <div className="flex flex-wrap gap-2">
            {MUSIC_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  data.musicGenres.includes(genre)
                    ? genre === "No Music"
                      ? "border-zinc-500 bg-zinc-500/15 text-zinc-400"
                      : "border-violet-500 bg-violet-500/15 text-violet-400"
                    : "border-border text-text-secondary hover:border-border-hover"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Spotify Connect */}
        <div className="glass-card p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-400">
              <Music size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">
                Connect Spotify
              </h3>
              <p className="mb-3 text-sm text-text-secondary">
                Control music directly during teaching sessions. Create
                playlists and search songs from the class builder.
              </p>
              {data.spotifyConnected ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle size={16} />
                  Spotify Connected
                </div>
              ) : (
                <button
                  onClick={handleConnectSpotify}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <Music size={16} />
                  Connect Spotify
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
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
