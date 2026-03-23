import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
  Sparkles,
  X,
} from "lucide-react-native";
import { SafeAreaView as SAV } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useClassBuilderStore,
  useAuthStore,
  useTeachingModeStore,
  formatDuration,
  MOBILE_METHODS,
  CATEGORIES,
  type Exercise,
} from "@propilates/shared";
import { Badge } from "../../../src/components/ui/Badge";
import { DurationPicker } from "../../../src/components/ui/DurationPicker";
import { CreateExerciseSheet } from "../../../src/components/builder/CreateExerciseSheet";
import { supabase } from "../../../src/lib/supabase";
import { cn } from "../../../src/lib/cn";
import { useThemeColors } from "../../../src/lib/theme";
import { fonts } from "../../../src/lib/fonts";

type Segment = "blocks" | "details" | "exercises";

export default function BuilderScreen() {
  const router = useRouter();
  const store = useClassBuilderStore();
  const { instructor, tier } = useAuthStore();
  const loadBlocks = useTeachingModeStore((s) => s.loadBlocks);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [segment, setSegment] = useState<Segment>("exercises");
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [newBlockName, setNewBlockName] = useState("");
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const isPremium = tier === "premium";
  const colors = useThemeColors();

  useEffect(() => {
    async function loadExercises() {
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

      if (instructor?.id) {
        const { data: custom } = await supabase
          .from("exercises")
          .select("*")
          .eq("is_custom", true)
          .eq("creator_id", instructor.id)
          .order("name");
        if (custom) all = [...all, ...(custom as Exercise[])];
      }

      setExercises(all);
    }
    loadExercises();
  }, [instructor]);

  const handleExerciseCreated = useCallback(
    async (exercise: Exercise) => {
      if (isPremium && instructor) {
        const { data } = await supabase
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
          setExercises((prev) => [...prev, { ...exercise, creator_id: instructor.id }]);
        }
      } else {
        setExercises((prev) => [...prev, exercise]);
      }
    },
    [isPremium, instructor],
  );

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (
        store.browserSearch &&
        !ex.name.toLowerCase().includes(store.browserSearch.toLowerCase())
      )
        return false;
      if (store.browserMethod !== "all" && ex.method !== store.browserMethod)
        return false;
      if (store.browserCategory && ex.category !== store.browserCategory)
        return false;
      return true;
    });
  }, [exercises, store.browserSearch, store.browserMethod, store.browserCategory]);

  const selectedBlock = store.blocks.find(
    (b) => b.id === store.selectedBlockId,
  );
  const selectedExercise = selectedBlock?.exercises.find(
    (e) => e.id === store.selectedExerciseId,
  );

  const handleAddBlock = () => {
    const name = newBlockName.trim() || `Block ${store.blocks.length + 1}`;
    store.addBlock(name);
    setNewBlockName("");
    setSegment("blocks");
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!store.selectedBlockId) {
      Alert.alert("No Block", "Select a block first to add exercises.");
      return;
    }
    store.addExerciseToBlock(store.selectedBlockId, exercise);
  };

  const handleSave = async () => {
    if (!instructor || tier !== "premium") return;
    try {
      // Persist temp custom exercises first
      const tempIdMap = new Map<string, string>();
      for (const block of store.blocks) {
        for (const ex of block.exercises) {
          if (ex.exercise_id.startsWith("temp-") && ex.exercise) {
            const { data: saved } = await supabase
              .from("exercises")
              .insert({
                name: ex.exercise.name,
                method: ex.exercise.method,
                category: ex.exercise.category,
                difficulty: ex.exercise.difficulty,
                muscle_groups: ex.exercise.muscle_groups,
                description: ex.exercise.description,
                cues: ex.exercise.cues,
                default_duration: ex.exercise.default_duration,
                objective: ex.exercise.objective,
                apparatus: ex.exercise.apparatus,
                start_position: ex.exercise.start_position,
                movement: ex.exercise.movement,
                pace: ex.exercise.pace,
                school: ex.exercise.school,
                creator_id: instructor.id,
                is_custom: true,
                is_public: false,
              })
              .select()
              .single();
            if (saved) tempIdMap.set(ex.exercise_id, saved.id);
          }
        }
      }

      const { data: classData, error } = await supabase
        .from("classes")
        .insert({
          instructor_id: instructor.id,
          title: store.title || "Untitled Class",
          description: store.description,
          method: store.method,
          class_type: store.classType,
          difficulty: store.difficulty,
          duration_minutes: Math.ceil(store.totalDuration() / 60),
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      for (const block of store.blocks) {
        const { data: blockData } = await supabase
          .from("class_blocks")
          .insert({
            class_id: classData.id,
            name: block.name,
            order_index: block.order_index,
          })
          .select()
          .single();

        if (blockData) {
          for (const ex of block.exercises) {
            const resolvedId = tempIdMap.get(ex.exercise_id) || ex.exercise_id;
            await supabase.from("block_exercises").insert({
              block_id: blockData.id,
              exercise_id: resolvedId,
              order_index: ex.order_index,
              duration: ex.duration,
              reps: ex.reps,
              side: ex.side,
              notes: ex.notes,
            });
          }
        }
      }
      Alert.alert("Saved", "Class saved successfully!");
    } catch (err) {
      Alert.alert("Error", "Failed to save class.");
    }
  };

  return (
    <SAV style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Class Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <TextInput
          style={{ fontFamily: fonts.bold, fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}
          placeholder="Class Title..."
          placeholderTextColor={colors.textMuted}
          value={store.title}
          onChangeText={store.setTitle}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {MOBILE_METHODS.map((m) => {
              const active = store.method === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => store.setMethod(m.value)}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    backgroundColor: active ? colors.accent : colors.bgCard,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: active ? '#fff' : colors.textPrimary,
                    }}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {formatDuration(store.totalDuration())}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={tier !== "premium"}
            style={{
              flex: 1,
              borderRadius: 10,
              paddingVertical: 10,
              backgroundColor: tier === "premium" ? colors.accent : colors.bgElevated,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '600',
                color: tier === "premium" ? '#fff' : colors.textMuted,
              }}
            >
              {tier === "premium" ? "Save" : "Premium to Save"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={store.blocks.length === 0}
            style={{
              flex: 1,
              borderRadius: 10,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.accent,
            }}
            onPress={() => {
              loadBlocks(store.blocks);
              router.push("/(tabs)/teach");
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.accent }}>
              Teach
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segment Control */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 12, padding: 4, marginHorizontal: 16, marginVertical: 8 }}>
        {(["blocks", "details", "exercises"] as Segment[]).map((s) => {
          const active = segment === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setSegment(s)}
              style={{
                flex: 1,
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: active ? colors.accent : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  color: active ? '#fff' : colors.textPrimary,
                }}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {segment === "blocks" && (
        <ScrollView className="flex-1 px-4 pt-4">
          <View className="mb-4 flex-row items-center gap-2">
            <TextInput
              className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-text-primary"
              placeholder="Block name..."
              placeholderTextColor={colors.textMuted}
              value={newBlockName}
              onChangeText={setNewBlockName}
            />
            <TouchableOpacity
              onPress={handleAddBlock}
              style={{ borderRadius: 8, backgroundColor: colors.accent, padding: 8 }}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
            {store.blocks.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Clear All Blocks",
                    "This will remove all blocks and exercises. Are you sure?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear All",
                        style: "destructive",
                        onPress: () => store.resetBuilder(),
                      },
                    ],
                  )
                }
                className="flex-row items-center gap-1 rounded-lg border border-red-500/30 px-2 py-2"
              >
                <Trash2 size={14} color={colors.error} />
                <Text className="text-xs text-red-400">Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {store.blocks.map((block) => (
            <TouchableOpacity
              key={block.id}
              onPress={() => {
                store.selectBlock(block.id);
                setExpandedBlock(
                  expandedBlock === block.id ? null : block.id,
                );
              }}
              className={cn(
                "mb-3 rounded-xl border p-3",
                store.selectedBlockId === block.id
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-border bg-bg-card",
              )}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-text-primary">
                    {block.name}
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {block.exercises.length} exercises ·{" "}
                    {formatDuration(
                      block.exercises.reduce((s, e) => s + e.duration, 0),
                    )}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => store.removeBlock(block.id)}
                  >
                    <Trash2 size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                  {expandedBlock === block.id ? (
                    <ChevronUp size={16} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={16} color={colors.textSecondary} />
                  )}
                </View>
              </View>
              {expandedBlock === block.id && block.exercises.length > 0 && (
                <View className="mt-3 border-t border-border pt-3">
                  {block.exercises.map((ex) => (
                    <TouchableOpacity
                      key={ex.id}
                      onPress={() => {
                        store.selectExercise(ex.id);
                        setSegment("details");
                      }}
                      className="flex-row items-center justify-between py-1.5"
                    >
                      <Text className="flex-1 text-sm text-text-secondary">
                        {ex.exercise?.name ?? "Exercise"}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-text-muted">
                          {formatDuration(ex.duration)}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            store.removeExerciseFromBlock(block.id, ex.id)
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={14} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
          {store.blocks.length === 0 && (
            <Text className="mt-8 text-center text-text-muted">
              Add a block to start building your class
            </Text>
          )}
        </ScrollView>
      )}

      {segment === "details" && (
        <ScrollView className="flex-1 px-4 pt-4">
          {selectedExercise?.exercise ? (
            <View className="gap-4">
              <View>
                <Text className="text-xl font-bold text-text-primary">
                  {selectedExercise.exercise.name}
                </Text>
                <View className="mt-2 flex-row gap-2">
                  <Badge variant="violet">
                    {selectedExercise.exercise.method}
                  </Badge>
                  <Badge variant="blue">
                    {selectedExercise.exercise.category}
                  </Badge>
                  <Badge variant="gray">
                    {selectedExercise.exercise.difficulty}
                  </Badge>
                </View>
              </View>

              {selectedExercise.exercise.cues.length > 0 && (
                <View className="rounded-xl border border-border bg-bg-card p-3">
                  <Text className="mb-2 text-sm font-semibold text-text-secondary">
                    Teaching Cues
                  </Text>
                  {selectedExercise.exercise.cues.map((cue, i) => (
                    <Text key={i} className="text-sm text-text-primary mb-1">
                      • {cue}
                    </Text>
                  ))}
                </View>
              )}

              {/* Duration Picker */}
              <DurationPicker
                value={selectedExercise.duration}
                onChange={(v) =>
                  store.updateBlockExercise(
                    selectedExercise.block_id,
                    selectedExercise.id,
                    { duration: v },
                  )
                }
              />

              {/* Reps */}
              <View>
                <Text className="mb-1 text-sm text-text-secondary">Reps</Text>
                <TextInput
                  className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-text-primary"
                  keyboardType="number-pad"
                  placeholder="Optional"
                  placeholderTextColor={colors.textMuted}
                  value={selectedExercise.reps?.toString() ?? ""}
                  onChangeText={(v) =>
                    store.updateBlockExercise(
                      selectedExercise.block_id,
                      selectedExercise.id,
                      { reps: v ? parseInt(v) : null },
                    )
                  }
                />
              </View>

              {/* Side */}
              <View>
                <Text className="mb-1 text-sm text-text-secondary">Side</Text>
                <View className="flex-row gap-2">
                  {(["both", "left", "right"] as const).map((side) => (
                    <TouchableOpacity
                      key={side}
                      onPress={() =>
                        store.updateBlockExercise(
                          selectedExercise.block_id,
                          selectedExercise.id,
                          { side },
                        )
                      }
                      className={cn(
                        "rounded-lg border px-3 py-1.5",
                        selectedExercise.side === side
                          ? "border-violet-500 bg-violet-500/20"
                          : "border-border bg-bg-elevated",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-sm capitalize",
                          selectedExercise.side === side
                            ? "text-violet-400"
                            : "text-text-secondary",
                        )}
                      >
                        {side}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View>
                <Text className="mb-1 text-sm text-text-secondary">Notes</Text>
                <TextInput
                  className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-text-primary"
                  multiline
                  numberOfLines={3}
                  placeholder="Personal teaching notes..."
                  placeholderTextColor={colors.textMuted}
                  value={selectedExercise.notes}
                  onChangeText={(v) =>
                    store.updateBlockExercise(
                      selectedExercise.block_id,
                      selectedExercise.id,
                      { notes: v },
                    )
                  }
                />
              </View>
            </View>
          ) : (
            <Text className="mt-8 text-center text-text-muted">
              Select an exercise from a block to view details
            </Text>
          )}
        </ScrollView>
      )}

      {segment === "exercises" && (
        <View className="flex-1 pt-4">
          <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: colors.bgCard, paddingHorizontal: 12 }}>
              <Search size={16} color={colors.textMuted} />
              <TextInput
                style={{ flex: 1, paddingVertical: 10, paddingLeft: 8, fontSize: 15, color: colors.textPrimary }}
                placeholder="Search exercises..."
                placeholderTextColor={colors.textMuted}
                value={store.browserSearch}
                onChangeText={store.setBrowserSearch}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowCreateSheet(true)}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={18} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 px-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {[{ value: "all", label: "All" }, ...MOBILE_METHODS].map((m) => {
              const active = store.browserMethod === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => store.setBrowserMethod(m.value)}
                  style={{
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: active ? colors.accent : colors.bgCard,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: active ? "#fff" : "#1A1A2E",
                    }}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text className="px-4 mb-2 text-xs text-text-muted">
            {filteredExercises.length} exercises
          </Text>
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleAddExercise(item)}
                className="flex-row items-center justify-between border-b border-border py-3"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-medium text-text-primary">
                      {item.name}
                    </Text>
                    {item.is_custom && (
                      <Sparkles size={12} color={colors.accent} />
                    )}
                  </View>
                  <View className="mt-1 flex-row items-center gap-2">
                    <Badge variant="violet">{item.method}</Badge>
                    <Text className="text-xs text-text-muted">
                      {item.default_duration}s
                    </Text>
                    {item.is_custom && (
                      <Text className="text-[10px] text-amber-400">
                        {item.id.startsWith("temp-") ? "Session" : "Custom"}
                      </Text>
                    )}
                  </View>
                </View>
                <Plus size={20} color={colors.accent} />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <CreateExerciseSheet
        visible={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onCreated={handleExerciseCreated}
        isPremium={isPremium}
      />
    </SAV>
  );
}
