"use client";

import { useEffect, useState } from "react";
import { Layers, List, Search } from "lucide-react";
import { BlocksPanel } from "@/components/builder/BlocksPanel";
import { ExerciseDetail } from "@/components/builder/ExerciseDetail";
import { ExerciseBrowser } from "@/components/builder/ExerciseBrowser";
import { ClassHeader } from "@/components/builder/ClassHeader";
import { SpotifyPanel } from "@/components/builder/SpotifyPanel";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

type MobileTab = "blocks" | "detail" | "browse";

export default function BuilderPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
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

  // Auto-switch to detail tab when an exercise is selected (mobile)
  useEffect(() => {
    if (selectedExerciseId && window.innerWidth < 768) {
      setMobileTab("detail");
    }
  }, [selectedExerciseId]);

  // Find the selected exercise detail
  const selectedExercise = selectedExerciseId
    ? blocks
        .flatMap((b) => b.exercises)
        .find((e) => e.id === selectedExerciseId)
    : null;

  const mobileTabs: { id: MobileTab; label: string; icon: typeof Layers }[] = [
    { id: "blocks", label: "Blocks", icon: List },
    { id: "detail", label: "Detail", icon: Layers },
    { id: "browse", label: "Exercises", icon: Search },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ClassHeader />

      {/* Mobile tab bar */}
      <div className="flex border-b border-border md:hidden">
        {mobileTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMobileTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              mobileTab === id
                ? "border-b-2 border-violet-500 text-violet-400"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto">
          <BlocksPanel />
        </div>
        <div className="flex-1 overflow-y-auto border-r border-border">
          <ExerciseDetail blockExercise={selectedExercise} />
        </div>
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          <ExerciseBrowser exercises={exercises} isLoading={isLoading} />
        </div>
      </div>

      {/* Mobile: tabbed panels */}
      <div className="flex-1 overflow-y-auto md:hidden">
        {mobileTab === "blocks" && <BlocksPanel />}
        {mobileTab === "detail" && (
          <ExerciseDetail blockExercise={selectedExercise} />
        )}
        {mobileTab === "browse" && (
          <ExerciseBrowser exercises={exercises} isLoading={isLoading} />
        )}
      </div>

      {/* Full-width Spotify bar at bottom */}
      <SpotifyPanel />
    </div>
  );
}
