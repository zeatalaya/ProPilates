"use client";

import { useEffect, useState, useCallback } from "react";
import { Layers, List, Search } from "lucide-react";
import { BlocksPanel } from "@/components/builder/BlocksPanel";
import { ExerciseDetail } from "@/components/builder/ExerciseDetail";
import { ExerciseBrowser } from "@/components/builder/ExerciseBrowser";
import { ClassHeader } from "@/components/builder/ClassHeader";
import { SpotifyPanel } from "@/components/builder/SpotifyPanel";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { useAuthStore } from "@/stores/auth";
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
  const { instructor, tier } = useAuthStore();
  const isPremium = tier === "premium";

  useEffect(() => {
    async function loadExercises() {
      // Load library exercises (seeded, not custom)
      const { data: library } = await supabase
        .from("exercises")
        .select("*")
        .or("is_custom.is.null,is_custom.eq.false")
        .order("method")
        .order("name");

      let all: Exercise[] = (library ?? []).map((e: any) => ({
        ...e,
        is_custom: e.is_custom ?? false,
        is_public: e.is_public ?? false,
        creator_id: e.creator_id ?? null,
      }));

      // Load instructor's custom exercises
      if (instructor?.id) {
        const { data: custom } = await supabase
          .from("exercises")
          .select("*")
          .eq("is_custom", true)
          .eq("creator_id", instructor.id)
          .order("name");
        if (custom) {
          all = [...all, ...(custom as Exercise[])];
        }

        // Load custom exercises from purchased classes
        const { data: purchased } = await supabase
          .from("portfolio_access")
          .select("class_id")
          .eq("buyer_address", instructor.xion_address);
        if (purchased && purchased.length > 0) {
          const classIds = purchased.map((p: any) => p.class_id);
          const { data: purchasedExercises } = await supabase
            .from("block_exercises")
            .select("exercise:exercises!inner(*)")
            .in("block_id",
              (await supabase
                .from("class_blocks")
                .select("id")
                .in("class_id", classIds)
              ).data?.map((b: any) => b.id) ?? []
            );
          if (purchasedExercises) {
            const customFromPurchases = purchasedExercises
              .map((pe: any) => pe.exercise)
              .filter((e: any) => e?.is_custom)
              .filter((e: any) => !all.some((a) => a.id === e.id));
            all = [...all, ...(customFromPurchases as Exercise[])];
          }
        }
      }

      // Also load public custom exercises from other users
      const { data: publicCustom } = await supabase
        .from("exercises")
        .select("*")
        .eq("is_custom", true)
        .eq("is_public", true);
      if (publicCustom) {
        const newPublic = (publicCustom as Exercise[]).filter(
          (e) => !all.some((a) => a.id === e.id),
        );
        all = [...all, ...newPublic];
      }

      setExercises(all);
      setIsLoading(false);
    }
    loadExercises();
  }, [instructor]);

  const handleExerciseCreated = useCallback(
    async (exercise: Exercise) => {
      if (isPremium && instructor) {
        // Save to Supabase immediately for premium users
        const { data, error } = await supabase
          .from("exercises")
          .insert({
            name: exercise.name,
            method: exercise.method,
            category: exercise.category,
            difficulty: exercise.difficulty,
            muscle_groups: exercise.muscle_groups,
            description: exercise.description,
            cues: exercise.cues,
            default_duration: exercise.default_duration,
            objective: exercise.objective,
            apparatus: exercise.apparatus,
            start_position: exercise.start_position,
            movement: exercise.movement,
            pace: exercise.pace,
            school: exercise.school,
            creator_id: instructor.id,
            is_custom: true,
            is_public: false,
          })
          .select()
          .single();

        if (data) {
          setExercises((prev) => [...prev, data as Exercise]);
        } else {
          // Fallback: add with temp ID if save fails
          console.error("Failed to save exercise:", error);
          setExercises((prev) => [...prev, { ...exercise, creator_id: instructor.id }]);
        }
      } else {
        // Free tier: add to session only (temp ID)
        setExercises((prev) => [...prev, exercise]);
      }
    },
    [isPremium, instructor],
  );

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
          <ExerciseBrowser exercises={exercises} isLoading={isLoading} onExerciseCreated={handleExerciseCreated} isPremium={isPremium} />
        </div>
      </div>

      {/* Mobile: tabbed panels */}
      <div className="flex-1 overflow-y-auto md:hidden">
        {mobileTab === "blocks" && <BlocksPanel />}
        {mobileTab === "detail" && (
          <ExerciseDetail blockExercise={selectedExercise} />
        )}
        {mobileTab === "browse" && (
          <ExerciseBrowser exercises={exercises} isLoading={isLoading} onExerciseCreated={handleExerciseCreated} isPremium={isPremium} />
        )}
      </div>

      {/* Full-width Spotify bar at bottom */}
      <SpotifyPanel />
    </div>
  );
}
