import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Briefcase,
  Plus,
  Layers,
  Sparkles,
  Globe,
  Lock,
  Trash2,
  Dumbbell,
  ShoppingBag,
  Play,
  BookOpen,
} from "lucide-react-native";
import {
  useAuthStore,
  useClassBuilderStore,
  useTeachingModeStore,
  type Exercise,
  type PilatesClass,
  type ClassBlock,
  type BlockExercise,
} from "@propilates/shared";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { CreateExerciseSheet } from "../../../src/components/builder/CreateExerciseSheet";
import { supabase } from "../../../src/lib/supabase";
import { useThemeColors } from "../../../src/lib/theme";

type Tab = "classes" | "exercises" | "purchased";

interface PurchasedClass {
  id: string;
  class_id: string;
  token_id: string;
  price_paid: number;
  purchased_at: string;
  title: string;
  method: string;
  difficulty: string;
  duration_minutes: number;
  instructor_name: string;
}

export default function PortfolioScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { instructor, tier, xionAddress } = useAuthStore();
  const builderStore = useClassBuilderStore();
  const teachingStore = useTeachingModeStore();
  const [activeTab, setActiveTab] = useState<Tab>("classes");
  const [classes, setClasses] = useState<PilatesClass[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [purchased, setPurchased] = useState<PurchasedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const loadData = useCallback(async () => {
    if (!instructor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [classesRes, exercisesRes] = await Promise.all([
      supabase
        .from("classes")
        .select("*")
        .eq("instructor_id", instructor.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("exercises")
        .select("*")
        .eq("is_custom", true)
        .eq("creator_id", instructor.id)
        .order("name"),
    ]);
    if (classesRes.data) setClasses(classesRes.data as PilatesClass[]);
    if (exercisesRes.data) setCustomExercises(exercisesRes.data as Exercise[]);

    // Load purchased classes
    if (xionAddress) {
      const { data: purchases } = await supabase
        .from("portfolio_access")
        .select("*, class:classes(title, method, difficulty, duration_minutes, instructor:instructors(name))")
        .eq("buyer_address", xionAddress)
        .order("purchased_at", { ascending: false });

      if (purchases) {
        setPurchased(
          purchases.map((p: any) => ({
            id: p.id,
            class_id: p.class_id,
            token_id: p.token_id,
            price_paid: p.price_paid,
            purchased_at: p.purchased_at,
            title: p.class?.title || "Unknown Class",
            method: p.class?.method || "mat",
            difficulty: p.class?.difficulty || "intermediate",
            duration_minutes: p.class?.duration_minutes || 0,
            instructor_name: p.class?.instructor?.name || "Unknown",
          })),
        );
      }
    }

    setLoading(false);
  }, [instructor, xionAddress]);

  // Reload data every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

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
    Alert.alert("Delete Exercise", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("id", exerciseId);
          if (!error) {
            setCustomExercises((prev) => prev.filter((e) => e.id !== exerciseId));
          }
        },
      },
    ]);
  }

  async function handleLoadClass(classId: string, navigateTo: "builder" | "teach") {
    try {
      // Fetch the class data
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (!classData) {
        Alert.alert("Error", "Class not found.");
        return;
      }

      // Fetch class_blocks ordered by order_index
      const { data: blocksData } = await supabase
        .from("class_blocks")
        .select("*")
        .eq("class_id", classId)
        .order("order_index");

      if (!blocksData) {
        Alert.alert("Error", "Failed to load class blocks.");
        return;
      }

      // For each block, fetch block_exercises with joined exercise data
      const blocks: ClassBlock[] = [];
      for (const block of blocksData) {
        const { data: exercisesData } = await supabase
          .from("block_exercises")
          .select("*, exercise:exercises(*)")
          .eq("block_id", block.id)
          .order("order_index");

        const exercises: BlockExercise[] = (exercisesData ?? []).map((be: any) => ({
          id: be.id,
          block_id: be.block_id,
          exercise_id: be.exercise_id,
          exercise: be.exercise
            ? {
                ...be.exercise,
                is_custom: be.exercise.is_custom ?? false,
                is_public: be.exercise.is_public ?? false,
                creator_id: be.exercise.creator_id ?? null,
              }
            : undefined,
          order_index: be.order_index,
          duration: be.duration,
          reps: be.reps,
          side: be.side,
          notes: be.notes ?? "",
        }));

        blocks.push({
          id: block.id,
          class_id: block.class_id,
          name: block.name,
          order_index: block.order_index,
          exercises,
        });
      }

      // Load into builder store
      builderStore.loadClass({
        title: classData.title,
        description: classData.description ?? "",
        method: classData.method,
        classType: classData.class_type,
        difficulty: classData.difficulty,
        durationMinutes: classData.duration_minutes,
        playlistId: classData.playlist_id ?? null,
        blocks,
      });

      if (navigateTo === "teach") {
        teachingStore.loadBlocks(blocks);
        router.push("/(tabs)/teach");
      } else {
        router.push("/(tabs)/builder");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load class.");
    }
  }

  async function handleExerciseCreated(exercise: Exercise) {
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
        setCustomExercises((prev) => [...prev, data as Exercise]);
      } else {
        setCustomExercises((prev) => [...prev, { ...exercise, creator_id: instructor.id }]);
      }
    } else {
      setCustomExercises((prev) => [...prev, exercise]);
    }
  }

  const isPremium = tier === "premium";

  const renderClassItem = ({ item }: { item: PilatesClass }) => (
    <View className="mb-3">
      <Card>
        <CardBody>
          <Text className="text-text-primary font-semibold text-base mb-1">
            {item.title}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Badge variant="violet">{item.method}</Badge>
            <Badge variant="blue">{item.difficulty}</Badge>
            {item.is_public && <Badge variant="emerald">Public</Badge>}
          </View>
          {item.description ? (
            <Text className="text-text-secondary text-sm mt-2" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View className="flex-row gap-2 mt-3 pt-2 border-t border-border">
            <TouchableOpacity
              onPress={() => handleLoadClass(item.id, "builder")}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-violet-500 py-2"
            >
              <BookOpen size={14} color="#a78bfa" />
              <Text className="text-sm font-medium text-violet-400">Builder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLoadClass(item.id, "teach")}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2"
            >
              <Play size={14} color="#fff" />
              <Text className="text-sm font-medium text-white">Teach</Text>
            </TouchableOpacity>
          </View>
        </CardBody>
      </Card>
    </View>
  );

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View className="mb-3">
      <Card>
        <CardBody>
          <View className="flex-row items-center gap-2 mb-1">
            <Sparkles size={14} color={colors.accent} />
            <Text className="text-text-primary font-semibold text-base flex-1">
              {item.name}
            </Text>
            {item.is_public ? (
              <Badge variant="emerald">Public</Badge>
            ) : (
              <Badge variant="gray">Private</Badge>
            )}
          </View>
          <View className="flex-row items-center gap-2 mt-1 mb-2">
            <Badge variant="violet">{item.method}</Badge>
            <Badge variant="blue">{item.category}</Badge>
            <Badge variant="gray">{item.difficulty}</Badge>
          </View>
          {item.description ? (
            <Text className="text-text-secondary text-sm mb-2" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-1 mb-2 flex-wrap">
            {item.muscle_groups.map((mg) => (
              <View key={mg} className="rounded bg-bg-elevated px-1.5 py-0.5">
                <Text className="text-[10px] text-text-muted">
                  {mg.replace("_", " ")}
                </Text>
              </View>
            ))}
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => toggleExercisePublic(item)}
              className="flex-row items-center gap-1 rounded-lg border border-border px-3 py-1.5"
            >
              {item.is_public ? (
                <Lock size={14} color={colors.textSecondary} />
              ) : (
                <Globe size={14} color={colors.textSecondary} />
              )}
              <Text className="text-xs text-text-secondary">
                {item.is_public ? "Make Private" : "Make Public"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteExercise(item.id)}
              className="flex-row items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5"
            >
              <Trash2 size={14} color={colors.error} />
              <Text className="text-xs text-red-400">Delete</Text>
            </TouchableOpacity>
          </View>
        </CardBody>
      </Card>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-text-primary">
            Portfolio
          </Text>
          <TouchableOpacity
            className="flex-row items-center bg-violet-600 rounded-xl px-4 py-2"
            onPress={() => router.push("/(tabs)/builder")}
          >
            <Plus size={16} color="#fff" />
            <Text className="text-white font-medium ml-1 text-sm">
              New Class
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-bg-card border border-border rounded-xl p-1">
          {(["classes", "exercises", "purchased"] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                activeTab === tab ? "bg-violet-600" : ""
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`font-medium text-xs ${
                  activeTab === tab ? "text-white" : "text-text-secondary"
                }`}
              >
                {tab === "classes"
                  ? `Classes${classes.length > 0 ? ` (${classes.length})` : ""}`
                  : tab === "exercises"
                    ? `Exercises${customExercises.length > 0 ? ` (${customExercises.length})` : ""}`
                    : `Purchased${purchased.length > 0 ? ` (${purchased.length})` : ""}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : !isPremium && activeTab !== "purchased" ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <Layers size={36} color={colors.accent} />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            Premium Required
          </Text>
          <Text className="text-text-secondary text-center">
            Upgrade to premium to save and manage your classes and exercises.
          </Text>
        </View>
      ) : activeTab === "classes" ? (
        classes.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
              <Layers size={36} color={colors.accent} />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              No Classes Yet
            </Text>
            <Text className="text-text-secondary text-center">
              Start building your first Pilates class in the Builder tab.
            </Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            renderItem={renderClassItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          />
        )
      ) : activeTab === "exercises" ? (
        customExercises.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
              <Dumbbell size={36} color={colors.accent} />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              No Custom Exercises
            </Text>
            <Text className="text-text-secondary text-center mb-4">
              Create custom exercises in the Builder to see them here.
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateSheet(true)}
              className="flex-row items-center gap-1.5 bg-violet-600 rounded-xl px-4 py-2.5"
            >
              <Plus size={16} color="#fff" />
              <Text className="text-white font-medium text-sm">Create Exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={customExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
            ListHeaderComponent={
              <TouchableOpacity
                onPress={() => setShowCreateSheet(true)}
                className="flex-row items-center justify-center gap-1.5 bg-violet-600 rounded-xl px-4 py-2.5 mb-4"
              >
                <Plus size={16} color="#fff" />
                <Text className="text-white font-medium text-sm">Create Exercise</Text>
              </TouchableOpacity>
            }
          />
        )
      ) : purchased.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <ShoppingBag size={36} color={colors.accent} />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            No Purchases Yet
          </Text>
          <Text className="text-text-secondary text-center">
            Classes you purchase from the marketplace will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={purchased}
          renderItem={({ item }) => (
            <View className="mb-3">
              <Card>
                <CardBody>
                  <Text className="text-text-primary font-semibold text-base mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-text-secondary text-sm mb-2">
                    by {item.instructor_name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Badge variant="violet">{item.method}</Badge>
                    <Badge variant="blue">{item.difficulty}</Badge>
                    <Text className="text-text-muted text-xs ml-auto">
                      {item.duration_minutes}m
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border">
                    <Text className="text-text-muted text-xs">
                      Purchased {new Date(item.purchased_at).toLocaleDateString()}
                    </Text>
                    <Text className="text-emerald-400 text-xs font-medium">
                      ${Number(item.price_paid).toFixed(2)} USDC
                    </Text>
                  </View>
                  <View className="flex-row gap-2 mt-3 pt-2 border-t border-border">
                    <TouchableOpacity
                      onPress={() => handleLoadClass(item.class_id, "builder")}
                      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-violet-500 py-2"
                    >
                      <BookOpen size={14} color="#a78bfa" />
                      <Text className="text-sm font-medium text-violet-400">Builder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleLoadClass(item.class_id, "teach")}
                      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2"
                    >
                      <Play size={14} color="#fff" />
                      <Text className="text-sm font-medium text-white">Teach</Text>
                    </TouchableOpacity>
                  </View>
                </CardBody>
              </Card>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        />
      )}
      <CreateExerciseSheet
        visible={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onCreated={handleExerciseCreated}
        isPremium={isPremium}
      />
    </SafeAreaView>
  );
}
