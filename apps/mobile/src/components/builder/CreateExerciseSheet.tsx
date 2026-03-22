import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X, Plus, Minus } from "lucide-react-native";
import type {
  Exercise,
  PilatesMethod,
  ExerciseCategory,
  Difficulty,
  MuscleGroup,
  ExercisePace,
  PilatesSchool,
} from "@propilates/shared";
import { useThemeColors } from "../../lib/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (exercise: Exercise) => void;
  isPremium: boolean;
}

const METHODS: PilatesMethod[] = [
  "mat", "reformer", "x-reformer", "chair", "tower", "barrel", "ring", "band", "foam_roller",
];

const CATEGORIES: ExerciseCategory[] = [
  "warmup", "strength", "flexibility", "balance", "cooldown", "flow", "cardio",
];

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

const MUSCLE_GROUPS: MuscleGroup[] = [
  "core", "legs", "arms", "back", "glutes", "shoulders", "full_body", "hip_flexors", "chest",
];

const PACES: ExercisePace[] = ["deliberate", "moderate", "flowing", "dynamic"];

const SCHOOLS: PilatesSchool[] = [
  "classical", "basi", "stott", "romana", "fletcher", "polestar", "balanced_body", "contemporary",
];

export function CreateExerciseSheet({ visible, onClose, onCreated, isPremium }: Props) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [method, setMethod] = useState<PilatesMethod>("mat");
  const [category, setCategory] = useState<ExerciseCategory>("strength");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(["core"]);
  const [description, setDescription] = useState("");
  const [cues, setCues] = useState<string[]>([""]);
  const [defaultDuration, setDefaultDuration] = useState("30");
  const [objective, setObjective] = useState("");
  const [apparatus, setApparatus] = useState("");
  const [startPosition, setStartPosition] = useState("");
  const [movement, setMovement] = useState<string[]>([""]);
  const [pace, setPace] = useState<ExercisePace | "">("");
  const [school, setSchool] = useState<PilatesSchool | "">("");

  function toggleMuscle(mg: MuscleGroup) {
    setMuscleGroups((prev) =>
      prev.includes(mg) ? prev.filter((m) => m !== mg) : [...prev, mg],
    );
  }

  function handleSubmit() {
    if (!name.trim()) return;

    const exercise: Exercise = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      method,
      category,
      difficulty,
      muscle_groups: muscleGroups,
      description: description.trim(),
      cues: cues.filter((c) => c.trim()),
      default_duration: parseInt(defaultDuration) || 30,
      image_url: null,
      video_url: null,
      objective: objective.trim() || null,
      apparatus: apparatus.trim() || null,
      start_position: startPosition.trim() || null,
      movement: movement.filter((m) => m.trim()).length > 0 ? movement.filter((m) => m.trim()) : null,
      pace: pace || null,
      school: school || null,
      creator_id: null,
      is_custom: true,
      is_public: false,
    };

    onCreated(exercise);
    resetForm();
    onClose();
  }

  function resetForm() {
    setName("");
    setMethod("mat");
    setCategory("strength");
    setDifficulty("beginner");
    setMuscleGroups(["core"]);
    setDescription("");
    setCues([""]);
    setDefaultDuration("30");
    setObjective("");
    setApparatus("");
    setStartPosition("");
    setMovement([""]);
    setPace("");
    setSchool("");
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-bg">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary">
            Create Exercise
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!name.trim()}
            className={`rounded-lg px-4 py-1.5 ${name.trim() ? "bg-violet-600" : "bg-bg-elevated"}`}
          >
            <Text className={`text-sm font-semibold ${name.trim() ? "text-white" : "text-text-muted"}`}>
              {isPremium ? "Save" : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        {!isPremium && (
          <View className="bg-amber-500/10 px-4 py-2">
            <Text className="text-xs text-amber-400">
              Free tier — exercise available this session only. Upgrade to premium to save.
            </Text>
          </View>
        )}

        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          {/* Name */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Name *</Text>
          <TextInput
            className="mb-4 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-text-primary"
            placeholder="e.g. Single Leg Bridge"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* Method */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMethod(m)}
                className={`rounded-lg px-3 py-1.5 ${method === m ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
              >
                <Text className={`text-xs font-medium capitalize ${method === m ? "text-white" : "text-text-secondary"}`}>
                  {m.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                className={`rounded-lg px-3 py-1.5 ${category === c ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
              >
                <Text className={`text-xs font-medium capitalize ${category === c ? "text-white" : "text-text-secondary"}`}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Difficulty */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Difficulty</Text>
          <View className="mb-4 flex-row gap-2">
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficulty(d)}
                className={`flex-1 items-center rounded-lg py-2 ${difficulty === d ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
              >
                <Text className={`text-xs font-medium capitalize ${difficulty === d ? "text-white" : "text-text-secondary"}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Muscle Groups */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Muscle Groups</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {MUSCLE_GROUPS.map((mg) => (
              <TouchableOpacity
                key={mg}
                onPress={() => toggleMuscle(mg)}
                className={`rounded-lg px-3 py-1.5 ${muscleGroups.includes(mg) ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
              >
                <Text className={`text-xs font-medium ${muscleGroups.includes(mg) ? "text-white" : "text-text-secondary"}`}>
                  {mg.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Description</Text>
          <TextInput
            className="mb-4 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-text-primary"
            placeholder="Brief description..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          {/* Duration */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Default Duration (seconds)</Text>
          <TextInput
            className="mb-4 w-24 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-text-primary"
            keyboardType="number-pad"
            value={defaultDuration}
            onChangeText={setDefaultDuration}
          />

          {/* Teaching Cues */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Teaching Cues</Text>
          {cues.map((cue, i) => (
            <View key={i} className="mb-2 flex-row items-center gap-2">
              <TextInput
                className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-text-primary"
                placeholder={`Cue ${i + 1}`}
                placeholderTextColor={colors.textMuted}
                value={cue}
                onChangeText={(v) => {
                  const next = [...cues];
                  next[i] = v;
                  setCues(next);
                }}
              />
              {cues.length > 1 && (
                <TouchableOpacity onPress={() => setCues(cues.filter((_, j) => j !== i))}>
                  <Minus size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={() => setCues([...cues, ""])} className="mb-4 flex-row items-center gap-1">
            <Plus size={14} color={colors.accent} />
            <Text className="text-xs text-violet-400">Add cue</Text>
          </TouchableOpacity>

          {/* Objective */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Objective (optional)</Text>
          <TextInput
            className="mb-4 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-text-primary"
            placeholder="Learning goal..."
            placeholderTextColor={colors.textMuted}
            value={objective}
            onChangeText={setObjective}
          />

          {/* Start Position */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Start Position (optional)</Text>
          <TextInput
            className="mb-4 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-text-primary"
            placeholder="e.g. Supine, knees bent..."
            placeholderTextColor={colors.textMuted}
            value={startPosition}
            onChangeText={setStartPosition}
          />

          {/* Movement Steps */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Movement Steps (optional)</Text>
          {movement.map((step, i) => (
            <View key={i} className="mb-2 flex-row items-center gap-2">
              <Text className="text-xs text-text-muted w-4">{i + 1}.</Text>
              <TextInput
                className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-text-primary"
                placeholder={`Step ${i + 1}`}
                placeholderTextColor={colors.textMuted}
                value={step}
                onChangeText={(v) => {
                  const next = [...movement];
                  next[i] = v;
                  setMovement(next);
                }}
              />
              {movement.length > 1 && (
                <TouchableOpacity onPress={() => setMovement(movement.filter((_, j) => j !== i))}>
                  <Minus size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={() => setMovement([...movement, ""])} className="mb-4 flex-row items-center gap-1">
            <Plus size={14} color={colors.accent} />
            <Text className="text-xs text-violet-400">Add step</Text>
          </TouchableOpacity>

          {/* Pace */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Pace (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
            <TouchableOpacity
              onPress={() => setPace("")}
              className={`rounded-lg px-3 py-1.5 ${pace === "" ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
            >
              <Text className={`text-xs font-medium ${pace === "" ? "text-white" : "text-text-secondary"}`}>None</Text>
            </TouchableOpacity>
            {PACES.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPace(p)}
                className={`rounded-lg px-3 py-1.5 ${pace === p ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
              >
                <Text className={`text-xs font-medium capitalize ${pace === p ? "text-white" : "text-text-secondary"}`}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* School */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">School (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
            <TouchableOpacity
              onPress={() => setSchool("")}
              className={`rounded-lg px-3 py-1.5 ${school === "" ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
            >
              <Text className={`text-xs font-medium ${school === "" ? "text-white" : "text-text-secondary"}`}>None</Text>
            </TouchableOpacity>
            {SCHOOLS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSchool(s)}
                className={`rounded-lg px-3 py-1.5 ${school === s ? "bg-violet-600" : "bg-bg-elevated border border-border"}`}
              >
                <Text className={`text-xs font-medium capitalize ${school === s ? "text-white" : "text-text-secondary"}`}>
                  {s.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Apparatus */}
          <Text className="mb-1 text-xs font-medium text-text-secondary">Apparatus / Equipment (optional)</Text>
          <TextInput
            className="mb-6 rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-text-primary"
            placeholder="e.g. Reformer with box"
            placeholderTextColor={colors.textMuted}
            value={apparatus}
            onChangeText={setApparatus}
          />

          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
}
