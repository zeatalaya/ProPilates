"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ArrowLeft,
  Volume2,
} from "lucide-react";
import { useTeachingModeStore } from "@/stores/teachingMode";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { useSpotifyStore } from "@/stores/spotify";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { TimerRing } from "@/components/ui/TimerRing";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, cn } from "@/lib/utils";

export default function TeachPage() {
  const router = useRouter();
  const builderBlocks = useClassBuilderStore((s) => s.blocks);
  const builderTitle = useClassBuilderStore((s) => s.title);
  const {
    blocks,
    currentBlockIndex,
    currentExerciseIndex,
    isPlaying,
    elapsed,
    loadBlocks,
    play,
    pause,
    togglePlayPause,
    tick,
    skipNext,
    skipPrev,
    currentBlock,
    currentExercise,
    nextExercise,
    progress,
    totalExercises,
    currentExerciseNumber,
    isComplete,
  } = useTeachingModeStore();

  const spotify = useSpotifyStore();
  const { togglePlay: toggleSpotify } = useSpotifyPlayer();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load blocks from builder on mount
  useEffect(() => {
    if (builderBlocks.length > 0) {
      loadBlocks(builderBlocks);
    }
  }, [builderBlocks, loadBlocks]);

  // Timer tick
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, tick]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowRight") {
        skipNext();
      } else if (e.code === "ArrowLeft") {
        skipPrev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlayPause, skipNext, skipPrev]);

  const exercise = currentExercise();
  const block = currentBlock();
  const next = nextExercise();
  const prog = progress();
  const complete = isComplete();

  if (blocks.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-text-muted">
            No class loaded. Build a class first.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push("/builder")}
          >
            Go to Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <button
          className="btn-ghost text-sm"
          onClick={() => router.push("/builder")}
        >
          <ArrowLeft size={16} />
          Back to Builder
        </button>
        <div className="text-sm font-medium text-text-secondary">
          {builderTitle || "Untitled Class"}
        </div>
        <div className="text-sm text-text-muted">
          {currentExerciseNumber()} / {totalExercises()}
        </div>
      </div>

      {/* Main teaching area */}
      <div className="flex flex-1 items-center justify-center gap-12 px-8">
        {/* Current exercise with timer */}
        <div className="flex flex-col items-center">
          <TimerRing progress={prog} size={280} strokeWidth={8}>
            <div className="text-center">
              <div className="text-4xl font-bold font-mono">
                {formatDuration(
                  Math.max(
                    0,
                    (exercise?.duration ?? 0) - elapsed,
                  ),
                )}
              </div>
              <div className="mt-1 text-sm text-text-muted">remaining</div>
            </div>
          </TimerRing>

          <div className="mt-8 text-center">
            <h1 className="text-3xl font-bold">
              {exercise?.exercise?.name ?? "—"}
            </h1>
            <div className="mt-2 flex justify-center gap-2">
              {exercise?.exercise && (
                <>
                  <Badge variant="violet">{exercise.exercise.method}</Badge>
                  <Badge variant="blue">{exercise.exercise.category}</Badge>
                </>
              )}
              {exercise?.side && (
                <Badge variant="amber">Side: {exercise.side}</Badge>
              )}
            </div>

            {/* Cues */}
            {exercise?.exercise?.cues && (
              <div className="mt-6 space-y-2">
                {exercise.exercise.cues.map((cue, i) => (
                  <div
                    key={i}
                    className="text-lg text-text-secondary"
                  >
                    {cue}
                  </div>
                ))}
              </div>
            )}

            {exercise?.notes && (
              <div className="mt-4 rounded-lg bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                {exercise.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: next exercise + block progress */}
        <div className="w-72 space-y-6">
          {/* Block progress */}
          <div className="glass-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-secondary">
              Current Block
            </h3>
            <div className="text-lg font-semibold">
              {block?.name ?? "—"}
            </div>
            <div className="mt-3 space-y-1">
              {block?.exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1 text-sm",
                    i === currentExerciseIndex
                      ? "bg-violet-500/20 text-violet-300 font-medium"
                      : i < currentExerciseIndex
                        ? "text-text-muted line-through"
                        : "text-text-secondary",
                  )}
                >
                  <span className="w-4 text-xs text-text-muted">
                    {i + 1}
                  </span>
                  {ex.exercise?.name ?? "Exercise"}
                </div>
              ))}
            </div>
          </div>

          {/* Next exercise */}
          {next && !complete && (
            <div className="glass-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                Up Next
              </h3>
              <div className="font-medium">
                {next.exercise?.name ?? "Exercise"}
              </div>
              <div className="mt-1 text-xs text-text-muted">
                {formatDuration(next.duration)}
              </div>
            </div>
          )}

          {complete && (
            <div className="glass-card border-emerald-500/30 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                Class Complete!
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Great teaching session.
              </p>
            </div>
          )}

          {/* Spotify mini player */}
          {spotify.isReady && spotify.currentTrack && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {spotify.currentTrack.name}
                  </div>
                  <div className="truncate text-xs text-text-muted">
                    {spotify.currentTrack.artist}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-6 border-t border-border py-6">
        <button className="btn-ghost" onClick={skipPrev}>
          <SkipBack size={24} />
        </button>
        <button
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-all",
            isPlaying
              ? "bg-violet-600 text-white hover:bg-violet-500"
              : "bg-violet-600 text-white hover:bg-violet-500",
          )}
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button className="btn-ghost" onClick={skipNext}>
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  );
}
