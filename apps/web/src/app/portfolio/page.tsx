"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  DollarSign,
  Trash2,
  Loader2,
  FolderOpen,
  Globe,
  Lock,
  Sparkles,
  Dumbbell,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { CONTRACTS } from "@/lib/xion-transactions";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, formatUsdc } from "@/lib/utils";
import type { PilatesClass, Exercise } from "@/types";

type PortfolioTab = "classes" | "exercises";

export default function PortfolioPage() {
  const { instructor, tier, oauthAccessToken, xionAddress } = useAuthStore();
  const [classes, setClasses] = useState<PilatesClass[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListing, setIsListing] = useState(false);
  const [activeTab, setActiveTab] = useState<PortfolioTab>("classes");

  useEffect(() => {
    if (!instructor) return;
    async function load() {
      const [classesRes, exercisesRes] = await Promise.all([
        supabase
          .from("classes")
          .select("*")
          .eq("instructor_id", instructor!.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("exercises")
          .select("*")
          .eq("is_custom", true)
          .eq("creator_id", instructor!.id)
          .order("name"),
      ]);
      if (classesRes.data) setClasses(classesRes.data as PilatesClass[]);
      if (exercisesRes.data) setCustomExercises(exercisesRes.data as Exercise[]);
      setIsLoading(false);
    }
    load();
  }, [instructor]);

  async function togglePublic(cls: PilatesClass) {
    const { error } = await supabase
      .from("classes")
      .update({ is_public: !cls.is_public })
      .eq("id", cls.id);
    if (!error) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === cls.id ? { ...c, is_public: !c.is_public } : c,
        ),
      );
    }
  }

  async function setPrice(cls: PilatesClass) {
    const input = prompt("Set price in USD (0 for free):");
    if (input === null) return;
    const price = parseFloat(input) || 0;
    const { error } = await supabase
      .from("classes")
      .update({ price })
      .eq("id", cls.id);
    if (!error) {
      setClasses((prev) =>
        prev.map((c) => (c.id === cls.id ? { ...c, price } : c)),
      );
    }
  }

  async function handleListOnMarketplace(cls: PilatesClass) {
    if (!xionAddress || !cls.price || !instructor) return;
    setIsListing(true);
    try {
      const tokenId = `propilates-${cls.id}-${Date.now()}`;
      const priceUsdc = String(Math.floor(cls.price * 1_000_000));

      if (CONTRACTS.nft && CONTRACTS.marketplace) {
        const res = await fetch("/api/nft/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId,
            priceAmount: priceUsdc,
            metadata: {
              class_id: cls.id,
              title: cls.title,
              description: cls.description,
              method: cls.method,
              difficulty: cls.difficulty,
              duration_minutes: cls.duration_minutes,
              instructor_id: instructor.id,
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }

        await supabase
          .from("classes")
          .update({ token_id: tokenId })
          .eq("id", cls.id);

        setClasses((prev) =>
          prev.map((c) =>
            c.id === cls.id ? { ...c, token_id: tokenId } : c,
          ),
        );

        alert("Listed successfully on the marketplace!");
      } else {
        console.log("Demo mode — listing:", { tokenId, priceUsdc, cls });
        await new Promise((r) => setTimeout(r, 1000));
        alert(
          "Listed on marketplace! (demo mode — contracts not yet deployed)",
        );
      }
    } catch (err: any) {
      alert(`Listing failed: ${err.message}`);
    } finally {
      setIsListing(false);
    }
  }

  async function handleDelete(classId: string) {
    if (!confirm("Delete this class? This cannot be undone.")) return;
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    }
  }

  async function toggleExercisePublic(exercise: Exercise) {
    const { error } = await supabase
      .from("exercises")
      .update({ is_public: !exercise.is_public })
      .eq("id", exercise.id);
    if (!error) {
      setCustomExercises((prev) =>
        prev.map((e) =>
          e.id === exercise.id ? { ...e, is_public: !e.is_public } : e,
        ),
      );
    }
  }

  async function handleDeleteExercise(exerciseId: string) {
    if (!confirm("Delete this exercise? This cannot be undone.")) return;
    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exerciseId);
    if (!error) {
      setCustomExercises((prev) => prev.filter((e) => e.id !== exerciseId));
    }
  }

  if (!instructor) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-muted">Sign in to view your portfolio.</p>
      </div>
    );
  }

  if (tier === "free") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <FolderOpen
            size={48}
            className="mx-auto mb-4 text-text-muted opacity-30"
          />
          <h2 className="text-xl font-bold">Premium Required</h2>
          <p className="mt-2 text-text-secondary">
            Upgrade to premium to save and monetize your classes and exercises.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Portfolio</h1>
        <p className="mt-2 text-text-secondary">
          Manage your saved classes and custom exercises.
        </p>
      </div>

      {/* Tab selector */}
      <div className="mb-6 flex gap-1 rounded-xl bg-bg-elevated p-1">
        <button
          onClick={() => setActiveTab("classes")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "classes"
              ? "bg-violet-600 text-white"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Classes{" "}
          {classes.length > 0 && (
            <span className="ml-1 text-xs opacity-70">({classes.length})</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "exercises"
              ? "bg-violet-600 text-white"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Exercises{" "}
          {customExercises.length > 0 && (
            <span className="ml-1 text-xs opacity-70">
              ({customExercises.length})
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : activeTab === "classes" ? (
        /* ── Classes Tab ── */
        classes.length === 0 ? (
          <div className="py-24 text-center">
            <FolderOpen
              size={48}
              className="mx-auto mb-4 text-text-muted opacity-30"
            />
            <p className="text-text-muted">
              No saved classes yet. Build your first class!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{cls.title}</h3>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="violet">{cls.method}</Badge>
                      <Badge variant="gray">{cls.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {cls.is_public ? (
                      <Badge variant="emerald">Public</Badge>
                    ) : (
                      <Badge variant="gray">Private</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="mb-4 text-sm text-text-secondary line-clamp-2">
                    {cls.description || "No description"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => togglePublic(cls)}
                    >
                      {cls.is_public ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                      {cls.is_public ? "Make Private" : "Make Public"}
                    </button>
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => setPrice(cls)}
                    >
                      <DollarSign size={14} />
                      {cls.price != null
                        ? `$${formatUsdc(cls.price)}`
                        : "Set Price"}
                    </button>
                    {cls.is_public &&
                      cls.price != null &&
                      cls.price > 0 &&
                      (cls.token_id ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-bg-elevated px-3 py-1.5 text-xs text-text-muted">
                          Listed
                        </span>
                      ) : (
                        <button
                          className="btn-primary text-xs"
                          onClick={() => handleListOnMarketplace(cls)}
                          disabled={isListing}
                        >
                          {isListing && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          List on Market
                        </button>
                      ))}
                    <button
                      className="btn-ghost text-xs text-red-400"
                      onClick={() => handleDelete(cls.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* ── Exercises Tab ── */
        customExercises.length === 0 ? (
          <div className="py-24 text-center">
            <Dumbbell
              size={48}
              className="mx-auto mb-4 text-text-muted opacity-30"
            />
            <p className="text-text-muted">
              No custom exercises yet. Create one in the Builder!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="flex-shrink-0 text-amber-400" />
                      <h3 className="truncate font-semibold">{exercise.name}</h3>
                    </div>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="violet">{exercise.method}</Badge>
                      <Badge variant="gray">{exercise.difficulty}</Badge>
                      <Badge variant="blue">{exercise.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {exercise.is_public ? (
                      <Badge variant="emerald">Public</Badge>
                    ) : (
                      <Badge variant="gray">Private</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="mb-2 text-sm text-text-secondary line-clamp-2">
                    {exercise.description || "No description"}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {exercise.muscle_groups.map((mg) => (
                      <span
                        key={mg}
                        className="rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted"
                      >
                        {mg.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{exercise.default_duration}s default</span>
                    {exercise.cues.length > 0 && (
                      <span>{exercise.cues.length} cues</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="btn-ghost text-xs"
                      onClick={() => toggleExercisePublic(exercise)}
                      title={
                        exercise.is_public
                          ? "Make private — only you and buyers of your classes can use it"
                          : "Make public — everyone can use it for free"
                      }
                    >
                      {exercise.is_public ? (
                        <Lock size={14} />
                      ) : (
                        <Globe size={14} />
                      )}
                      {exercise.is_public ? "Make Private" : "Make Public"}
                    </button>
                    <button
                      className="btn-ghost text-xs text-red-400"
                      onClick={() => handleDeleteExercise(exercise.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
