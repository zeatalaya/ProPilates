import React, { useEffect, useState, useMemo } from "react";
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
} from "lucide-react-native";
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
import { supabase } from "../../../src/lib/supabase";
import { cn } from "../../../src/lib/cn";

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

  useEffect(() => {
    supabase
      .from("exercises")
      .select("*")
      .order("method")
      .order("name")
      .then(({ data }) => {
        if (data) setExercises(data);
      });
  }, []);

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
            await supabase.from("block_exercises").insert({
              block_id: blockData.id,
              exercise_id: ex.exercise_id,
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
    <SafeAreaView className="flex-1 bg-bg">
      {/* Class Header */}
      <View className="border-b border-border px-4 py-3">
        <TextInput
          className="mb-2 text-xl font-bold text-text-primary"
          placeholder="Class Title..."
          placeholderTextColor="#55556a"
          value={store.title}
          onChangeText={store.setTitle}
        />
        <View className="flex-row items-center gap-3">
          <View className="flex-row gap-2">
            {MOBILE_METHODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => store.setMethod(m.value)}
                className={cn(
                  "rounded-lg px-2 py-1",
                  store.method === m.value
                    ? "bg-violet-600"
                    : "bg-bg-elevated",
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-medium",
                    store.method === m.value
                      ? "text-white"
                      : "text-text-secondary",
                  )}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row items-center gap-1 ml-auto">
            <Clock size={14} color="#8888a0" />
            <Text className="text-sm text-text-secondary">
              {formatDuration(store.totalDuration())}
            </Text>
          </View>
        </View>
        <View className="mt-2 flex-row gap-2">
          <TouchableOpacity
            onPress={handleSave}
            disabled={tier !== "premium"}
            className={cn(
              "flex-1 rounded-lg py-2",
              tier === "premium" ? "bg-violet-600" : "bg-bg-elevated",
            )}
          >
            <Text
              className={cn(
                "text-center text-sm font-semibold",
                tier === "premium" ? "text-white" : "text-text-muted",
              )}
            >
              {tier === "premium" ? "Save" : "Premium to Save"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={store.blocks.length === 0}
            className="flex-1 rounded-lg border border-violet-500 py-2"
            onPress={() => {
              loadBlocks(store.blocks);
              router.push("/(tabs)/teach");
            }}
          >
            <Text className="text-center text-sm font-semibold text-violet-400">
              Teach
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segment Control */}
      <View className="flex-row border-b border-border">
        {(["blocks", "details", "exercises"] as Segment[]).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSegment(s)}
            className={cn(
              "flex-1 py-3",
              segment === s && "border-b-2 border-violet-500",
            )}
          >
            <Text
              className={cn(
                "text-center text-sm font-semibold capitalize",
                segment === s ? "text-violet-400" : "text-text-muted",
              )}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {segment === "blocks" && (
        <ScrollView className="flex-1 px-4 pt-4">
          <View className="mb-4 flex-row items-center gap-2">
            <TextInput
              className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-text-primary"
              placeholder="Block name..."
              placeholderTextColor="#55556a"
              value={newBlockName}
              onChangeText={setNewBlockName}
            />
            <TouchableOpacity
              onPress={handleAddBlock}
              className="rounded-lg bg-violet-600 p-2"
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
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
                    <Trash2 size={16} color="#55556a" />
                  </TouchableOpacity>
                  {expandedBlock === block.id ? (
                    <ChevronUp size={16} color="#8888a0" />
                  ) : (
                    <ChevronDown size={16} color="#8888a0" />
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
                      <Text className="text-sm text-text-secondary">
                        {ex.exercise?.name ?? "Exercise"}
                      </Text>
                      <Text className="text-xs text-text-muted">
                        {formatDuration(ex.duration)}
                      </Text>
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
                  placeholderTextColor="#55556a"
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
                  placeholderTextColor="#55556a"
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
          <View className="px-4 mb-3">
            <View className="flex-row items-center rounded-lg border border-border bg-bg-elevated px-3">
              <Search size={16} color="#55556a" />
              <TextInput
                className="flex-1 py-2 pl-2 text-text-primary"
                placeholder="Search exercises..."
                placeholderTextColor="#55556a"
                value={store.browserSearch}
                onChangeText={store.setBrowserSearch}
              />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 px-4"
            contentContainerStyle={{ gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => store.setBrowserMethod("all")}
              className={cn(
                "rounded-lg px-3 py-1.5",
                store.browserMethod === "all"
                  ? "bg-violet-600"
                  : "bg-bg-elevated border border-border",
              )}
            >
              <Text
                className={cn(
                  "text-xs font-medium",
                  store.browserMethod === "all"
                    ? "text-white"
                    : "text-text-secondary",
                )}
              >
                All
              </Text>
            </TouchableOpacity>
            {MOBILE_METHODS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => store.setBrowserMethod(m.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5",
                  store.browserMethod === m.value
                    ? "bg-violet-600"
                    : "bg-bg-elevated border border-border",
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-medium",
                    store.browserMethod === m.value
                      ? "text-white"
                      : "text-text-secondary",
                  )}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
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
                  <Text className="font-medium text-text-primary">
                    {item.name}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    <Badge variant="violet">{item.method}</Badge>
                    <Text className="text-xs text-text-muted">
                      {item.default_duration}s
                    </Text>
                  </View>
                </View>
                <Plus size={20} color="#8257e5" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
