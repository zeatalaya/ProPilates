"use client";

import { useEffect, useState } from "react";
import { BlocksPanel } from "@/components/builder/BlocksPanel";
import { ExerciseDetail } from "@/components/builder/ExerciseDetail";
import { ExerciseBrowser } from "@/components/builder/ExerciseBrowser";
import { ClassHeader } from "@/components/builder/ClassHeader";
import { SpotifyPanel } from "@/components/builder/SpotifyPanel";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { supabase } from "@/lib/supabase";
import type { Exercise } from "@/types";

export default function BuilderPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedBlockId, selectedExerciseId, blocks } =
    useClassBuilderStore();

  // Spotify token extraction is now handled by SpotifyPlayerProvider in layout.tsx

  useEffect(() => {
    async function loadExercises() {
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .order("method")
        .order("name");
      if (data) setExercises(data as Exercise[]);
      setIsLoading(false);
    }
    loadExercises();
  }, []);

  // Find the selected exercise detail
  const selectedExercise = selectedExerciseId
    ? blocks
        .flatMap((b) => b.exercises)
        .find((e) => e.id === selectedExerciseId)
    : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ClassHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Blocks panel */}
        <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto">
          <BlocksPanel />
        </div>

        {/* Center: Exercise detail */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <ExerciseDetail blockExercise={selectedExercise} />
        </div>

        {/* Right: Exercise browser */}
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          <ExerciseBrowser
            exercises={exercises}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Full-width Spotify bar at bottom */}
      <SpotifyPanel />
    </div>
  );
}
