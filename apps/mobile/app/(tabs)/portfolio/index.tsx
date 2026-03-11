import React, { useEffect, useState } from "react";
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
import {
  Briefcase,
  Plus,
  Layers,
  Sparkles,
  Globe,
  Lock,
  Trash2,
  Dumbbell,
} from "lucide-react-native";
import { useAuthStore, type Exercise, type PilatesClass } from "@propilates/shared";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { supabase } from "../../../src/lib/supabase";

type Tab = "classes" | "exercises" | "purchased";

export default function PortfolioScreen() {
  const router = useRouter();
  const { instructor, tier } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("classes");
  const [classes, setClasses] = useState<PilatesClass[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!instructor) {
      setLoading(false);
      return;
    }
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
      setLoading(false);
    }
    load();
  }, [instructor]);

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

  const isPremium = tier === "premium";

  const renderClassItem = ({ item }: { item: PilatesClass }) => (
    <TouchableOpacity className="mb-3">
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
        </CardBody>
      </Card>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View className="mb-3">
      <Card>
        <CardBody>
          <View className="flex-row items-center gap-2 mb-1">
            <Sparkles size={14} color="#d4a44e" />
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
                <Lock size={14} color="#a0a0b8" />
              ) : (
                <Globe size={14} color="#a0a0b8" />
              )}
              <Text className="text-xs text-text-secondary">
                {item.is_public ? "Make Private" : "Make Public"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteExercise(item.id)}
              className="flex-row items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5"
            >
              <Trash2 size={14} color="#ef4444" />
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
                    : "Purchased"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#c9a96e" />
        </View>
      ) : !isPremium && activeTab !== "purchased" ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <Layers size={36} color="#c9a96e" />
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
              <Layers size={36} color="#c9a96e" />
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
              <Dumbbell size={36} color="#c9a96e" />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              No Custom Exercises
            </Text>
            <Text className="text-text-secondary text-center">
              Create custom exercises in the Builder to see them here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={customExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          />
        )
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <Briefcase size={36} color="#c9a96e" />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            No Purchases Yet
          </Text>
          <Text className="text-text-secondary text-center">
            Classes you purchase from the marketplace will appear here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
