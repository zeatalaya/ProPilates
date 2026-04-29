"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, Lock, ShoppingCart, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useClassBuilderStore } from "@/stores/classBuilder";
import { useAuthStore } from "@/stores/auth";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateDetailModal } from "@/components/templates/TemplateDetailModal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import type { PilatesClass, PilatesMethod, Difficulty, ClassBlock, BlockExercise } from "@/types";

const FREE_CLASS_LIMIT = 10;

type Tab = "free" | "premium" | "community";

const TABS: { value: Tab; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "community", label: "Community" },
];

const METHODS: { value: PilatesMethod | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "xR" },
];

const DIFFICULTIES: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const METHOD_GRADIENTS: Record<string, string> = {
  mat: "from-violet-600/20 to-violet-900/20",
  reformer: "from-blue-600/20 to-blue-900/20",
  "x-reformer": "from-emerald-600/20 to-emerald-900/20",
  chair: "from-amber-600/20 to-amber-900/20",
  tower: "from-rose-600/20 to-rose-900/20",
  barrel: "from-cyan-600/20 to-cyan-900/20",
};

const METHOD_BADGE: Record<string, "violet" | "blue" | "emerald" | "amber"> = {
  mat: "violet",
  reformer: "blue",
  "x-reformer": "emerald",
  chair: "amber",
  tower: "amber",
  barrel: "amber",
};

interface CommunityClass {
  id: string;
  title: string;
  description: string | null;
  method: PilatesMethod;
  difficulty: Difficulty;
  duration_minutes: number;
  price: number;
  instructor_id: string;
  instructor_name: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const loadClass = useClassBuilderStore((s) => s.loadClass);
  const tier = useAuthStore((s) => s.tier);

  const [activeTab, setActiveTab] = useState<Tab>("free");
  const [templates, setTemplates] = useState<PilatesClass[]>([]);
  const [communityClasses, setCommunityClasses] = useState<CommunityClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<PilatesMethod | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [previewTemplate, setPreviewTemplate] = useState<PilatesClass | null>(null);

  // Load template classes
  useEffect(() => {
    async function loadTemplates() {
      const { data } = await supabase
        .from("classes")
        .select(
          `
          *,
          class_blocks (
            *,
            block_exercises (
              *,
              exercise:exercises (*)
            )
          )
        `,
        )
        .eq("is_template", true)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: PilatesClass[] = data.map((cls: any) => ({
          ...cls,
          blocks: (cls.class_blocks ?? [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((blk: any) => ({
              ...blk,
              exercises: (blk.block_exercises ?? [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((bex: any) => ({
                  ...bex,
                  exercise: bex.exercise,
                })),
            })),
        }));
        setTemplates(mapped);
      }
      setIsLoading(false);
    }
    loadTemplates();
  }, []);

  // Load community classes when that tab is active
  useEffect(() => {
    if (activeTab !== "community") return;
    async function loadCommunity() {
      setIsCommunityLoading(true);
      const { data } = await supabase
        .from("classes")
        .select(
          `
          id,
          title,
          description,
          method,
          difficulty,
          duration_minutes,
          price,
          instructor_id,
          instructors ( display_name )
        `,
        )
        .eq("is_public", true)
        .not("price", "is", null)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: CommunityClass[] = data.map((cls: any) => ({
          id: cls.id,
          title: cls.title,
          description: cls.description,
          method: cls.method,
          difficulty: cls.difficulty,
          duration_minutes: cls.duration_minutes,
          price: cls.price,
          instructor_id: cls.instructor_id,
          instructor_name: cls.instructors?.display_name ?? "Unknown",
        }));
        setCommunityClasses(mapped);
      }
      setIsCommunityLoading(false);
    }
    loadCommunity();
  }, [activeTab]);

  // Split templates into free (first 10) and premium (rest)
  const freeTemplates = useMemo(() => templates.slice(0, FREE_CLASS_LIMIT), [templates]);
  const premiumTemplates = useMemo(() => templates.slice(FREE_CLASS_LIMIT), [templates]);

  // Apply method/difficulty filters
  function applyFilters<T extends { method: PilatesMethod; difficulty: Difficulty }>(items: T[]): T[] {
    return items.filter((t) => {
      if (methodFilter !== "all" && t.method !== methodFilter) return false;
      if (difficultyFilter !== "all" && t.difficulty !== difficultyFilter) return false;
      return true;
    });
  }

  const filteredFree = useMemo(() => applyFilters(freeTemplates), [freeTemplates, methodFilter, difficultyFilter]);
  const filteredPremium = useMemo(() => applyFilters(premiumTemplates), [premiumTemplates, methodFilter, difficultyFilter]);
  const filteredCommunity = useMemo(() => applyFilters(communityClasses), [communityClasses, methodFilter, difficultyFilter]);

  function handleUseTemplate(template: PilatesClass) {
    const blocks: ClassBlock[] = (template.blocks ?? []).map((blk) => ({
      id: crypto.randomUUID(),
      class_id: "",
      name: blk.name,
      order_index: blk.order_index,
      exercises: (blk.exercises ?? []).map((bex: BlockExercise) => ({
        id: crypto.randomUUID(),
        block_id: "",
        exercise_id: bex.exercise_id,
        exercise: bex.exercise,
        order_index: bex.order_index,
        duration: bex.duration,
        reps: bex.reps,
        side: bex.side,
        notes: bex.notes,
      })),
    }));

    loadClass({
      title: template.title,
      description: template.description,
      method: template.method,
      classType: template.class_type,
      difficulty: template.difficulty,
      durationMinutes: template.duration_minutes,
      playlistId: template.playlist_id,
      blocks,
    });

    router.push("/builder");
  }

  async function handlePurchase(classItem: CommunityClass) {
    setPurchasingId(classItem.id);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "marketplace",
          classId: classItem.id,
          amount: classItem.price,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setPurchasingId(null);
    }
  }

  const isPremium = tier === "premium";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Classes</h1>
        <p className="mt-2 text-text-secondary">
          Browse free templates, unlock premium class plans, or discover classes
          from the community.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.value
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                : "bg-bg-elevated text-text-muted hover:bg-bg-elevated/80 hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Method filter */}
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMethodFilter(m.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                methodFilter === m.value
                  ? "bg-violet-600 text-white"
                  : "bg-bg-elevated text-text-muted hover:text-text-secondary"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficultyFilter(d.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                difficultyFilter === d.value
                  ? d.value === "beginner"
                    ? "bg-emerald-600 text-white"
                    : d.value === "intermediate"
                      ? "bg-amber-600 text-white"
                      : d.value === "advanced"
                        ? "bg-violet-600 text-white"
                        : "bg-violet-600 text-white"
                  : "bg-bg-elevated text-text-muted hover:text-text-secondary"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────── FREE TAB ───────── */}
      {activeTab === "free" && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-violet-400" />
            </div>
          ) : filteredFree.length === 0 ? (
            <div className="py-24 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
              <p className="text-text-muted">
                {freeTemplates.length === 0
                  ? "No free templates available yet."
                  : "No templates match your filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFree.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onPreview={setPreviewTemplate}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ───────── PREMIUM TAB ───────── */}
      {activeTab === "premium" && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-violet-400" />
            </div>
          ) : !isPremium ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-600/10">
                <Lock size={36} className="text-violet-400" />
              </div>
              <h2 className="text-xl font-bold">Premium Classes</h2>
              <p className="mx-auto mt-2 max-w-md text-text-secondary">
                Upgrade to Premium to access {premiumTemplates.length}+ class
                plans crafted by certified instructors.
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="btn-primary mt-6 px-8 py-2.5"
              >
                Upgrade to Premium
              </button>
            </div>
          ) : filteredPremium.length === 0 ? (
            <div className="py-24 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
              <p className="text-text-muted">
                {premiumTemplates.length === 0
                  ? "No premium templates available yet."
                  : "No templates match your filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPremium.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onPreview={setPreviewTemplate}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ───────── COMMUNITY TAB ───────── */}
      {activeTab === "community" && (
        <>
          {isCommunityLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin text-violet-400" />
            </div>
          ) : filteredCommunity.length === 0 ? (
            <div className="py-24 text-center">
              <Users size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
              <p className="text-text-muted">
                No community classes available yet. Be the first to list one!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCommunity.map((cls) => {
                const gradient = METHOD_GRADIENTS[cls.method] ?? METHOD_GRADIENTS.mat;
                const badgeVariant = METHOD_BADGE[cls.method] ?? "violet";

                return (
                  <Card
                    key={cls.id}
                    className="overflow-hidden transition-all hover:border-violet-500/30"
                  >
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-br ${gradient} px-4 py-5`}>
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant={badgeVariant}>{cls.method}</Badge>
                        <span className="rounded-full bg-emerald-600/90 px-3 py-0.5 text-sm font-bold text-white">
                          ${cls.price.toFixed(2)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{cls.title}</h3>
                      {cls.description && (
                        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                          {cls.description}
                        </p>
                      )}
                    </div>

                    <CardBody>
                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span>{cls.duration_minutes}min</span>
                        <Badge
                          variant={
                            cls.difficulty === "beginner"
                              ? "emerald"
                              : cls.difficulty === "intermediate"
                                ? "amber"
                                : "violet"
                          }
                        >
                          {cls.difficulty}
                        </Badge>
                      </div>

                      {/* Instructor */}
                      <p className="mt-2 text-sm text-text-muted">
                        by {cls.instructor_name}
                      </p>

                      {/* Purchase button */}
                      <button
                        onClick={() => handlePurchase(cls)}
                        disabled={purchasingId === cls.id}
                        className="btn-primary mt-4 flex w-full items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        {purchasingId === cls.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={14} />
                        )}
                        {purchasingId === cls.id ? "Processing..." : "Purchase"}
                      </button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <TemplateDetailModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={(t) => {
            setPreviewTemplate(null);
            handleUseTemplate(t);
          }}
        />
      )}
    </div>
  );
}
