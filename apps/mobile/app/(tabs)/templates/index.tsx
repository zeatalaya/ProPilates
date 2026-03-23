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
import { fonts } from "../../../src/lib/fonts";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <Text style={{ fontFamily: fonts.bold, fontSize: 24, color: colors.textPrimary, marginBottom: 4 }}>
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
          style={{ marginBottom: 8 }}
          renderItem={({ item }) => {
            const active = methodFilter === item.value;
            return (
              <TouchableOpacity
                style={{
                  marginRight: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? colors.accent : colors.bgCard,
                }}
                onPress={() => setMethodFilter(item.value)}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: active ? '#fff' : colors.textSecondary,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Difficulty filters */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DIFFICULTY_FILTERS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const active = difficultyFilter === item.value;
            const activeColor =
              item.value === "beginner" ? colors.success
              : item.value === "intermediate" ? "#f59e0b"
              : colors.accent;
            return (
              <TouchableOpacity
                style={{
                  marginRight: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? activeColor + '18' : colors.bgCard,
                  borderWidth: active ? 1 : 0,
                  borderColor: active ? activeColor : 'transparent',
                }}
                onPress={() => setDifficultyFilter(item.value)}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: active ? activeColor : colors.textSecondary,
                  }}
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
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
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
