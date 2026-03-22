import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BookOpen } from "lucide-react-native";
import {
  useClassBuilderStore,
  MOBILE_METHODS,
  DIFFICULTIES,
} from "@propilates/shared";
import type {
  PilatesClass,
  PilatesMethod,
  Difficulty,
  ClassBlock,
  BlockExercise,
} from "@propilates/shared";
import { supabase } from "../../../src/lib/supabase";
import { TemplateCard } from "../../../src/components/templates/TemplateCard";
import { TemplateDetailModal } from "../../../src/components/templates/TemplateDetailModal";
import { useThemeColors } from "../../../src/lib/theme";

const METHOD_FILTERS: { value: PilatesMethod | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...MOBILE_METHODS.map((m) => ({
    value: m.value as PilatesMethod,
    label: m.label,
  })),
];

const DIFFICULTY_FILTERS: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  ...DIFFICULTIES.map((d) => ({
    value: d.value as Difficulty,
    label: d.label,
  })),
];

export default function TemplatesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const loadClass = useClassBuilderStore((s) => s.loadClass);
  const [templates, setTemplates] = useState<PilatesClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<PilatesMethod | "all">(
    "all",
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    Difficulty | "all"
  >("all");
  const [previewTemplate, setPreviewTemplate] =
    useState<PilatesClass | null>(null);

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

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (methodFilter !== "all" && t.method !== methodFilter) return false;
      if (difficultyFilter !== "all" && t.difficulty !== difficultyFilter)
        return false;
      return true;
    });
  }, [templates, methodFilter, difficultyFilter]);

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

    setPreviewTemplate(null);
    router.push("/(tabs)/builder");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-text-primary mb-1">
          Class Templates
        </Text>
        <Text className="text-sm text-text-secondary mb-4">
          Pre-built classes ready to teach or customize.
        </Text>

        {/* Method filters */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={METHOD_FILTERS}
          keyExtractor={(item) => item.value}
          className="mb-2"
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full border ${
                methodFilter === item.value
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-border bg-bg-card"
              }`}
              onPress={() => setMethodFilter(item.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  methodFilter === item.value
                    ? "text-violet-400"
                    : "text-text-secondary"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Difficulty filters */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DIFFICULTY_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const activeColor =
              item.value === "beginner"
                ? "border-emerald-500 bg-emerald-500/10"
                : item.value === "intermediate"
                  ? "border-amber-500 bg-amber-500/10"
                  : item.value === "advanced"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-violet-500 bg-violet-500/10";
            const activeText =
              item.value === "beginner"
                ? "text-emerald-400"
                : item.value === "intermediate"
                  ? "text-amber-400"
                  : item.value === "advanced"
                    ? "text-violet-400"
                    : "text-violet-400";

            return (
              <TouchableOpacity
                className={`mr-2 px-4 py-2 rounded-full border ${
                  difficultyFilter === item.value
                    ? activeColor
                    : "border-border bg-bg-card"
                }`}
                onPress={() => setDifficultyFilter(item.value)}
              >
                <Text
                  className={`text-sm font-medium ${
                    difficultyFilter === item.value
                      ? activeText
                      : "text-text-secondary"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Template list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <BookOpen size={36} color={colors.accent} />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            {templates.length === 0
              ? "No Templates Available"
              : "No Matches"}
          </Text>
          <Text className="text-text-secondary text-center">
            {templates.length === 0
              ? "Templates will appear here once they're published."
              : "Try adjusting your filters."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onPreview={setPreviewTemplate}
              onUse={handleUseTemplate}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        />
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <TemplateDetailModal
          template={previewTemplate}
          visible={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={(t) => {
            setPreviewTemplate(null);
            handleUseTemplate(t);
          }}
        />
      )}
    </SafeAreaView>
  );
}
