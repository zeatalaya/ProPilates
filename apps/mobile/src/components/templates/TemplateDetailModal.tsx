import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Clock, Layers, Dumbbell, Play } from "lucide-react-native";
import { Badge } from "../ui/Badge";
import type { PilatesClass } from "@propilates/shared";

const DIFFICULTY_BADGE: Record<string, "emerald" | "amber" | "violet"> = {
  beginner: "emerald",
  intermediate: "amber",
  advanced: "violet",
};

const METHOD_BADGE: Record<string, "violet" | "blue" | "emerald"> = {
  mat: "violet",
  reformer: "blue",
  "x-reformer": "emerald",
};

interface Props {
  template: PilatesClass;
  visible: boolean;
  onClose: () => void;
  onUse: (template: PilatesClass) => void;
}

export function TemplateDetailModal({
  template,
  visible,
  onClose,
  onUse,
}: Props) {
  const exerciseCount =
    template.blocks?.reduce(
      (sum, b) => sum + (b.exercises?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-bg">
        {/* Header */}
        <View className="flex-row items-start justify-between border-b border-border px-5 py-4">
          <View className="flex-1 mr-3">
            <View className="flex-row flex-wrap items-center gap-2 mb-2">
              <Badge variant={METHOD_BADGE[template.method] ?? "violet"}>
                {template.method}
              </Badge>
              <Badge
                variant={DIFFICULTY_BADGE[template.difficulty] ?? "gray"}
              >
                {template.difficulty}
              </Badge>
            </View>
            <Text className="text-xl font-bold text-text-primary">
              {template.title}
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              {template.description}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-lg p-2"
            onPress={onClose}
          >
            <X size={20} color="#55556a" />
          </TouchableOpacity>
        </View>

        {/* Stats bar */}
        <View className="flex-row items-center gap-6 border-b border-border px-5 py-3">
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color="#8888a0" />
            <Text className="text-sm text-text-secondary">
              {template.duration_minutes} min
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Layers size={14} color="#8888a0" />
            <Text className="text-sm text-text-secondary">
              {template.blocks?.length ?? 0} blocks
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Dumbbell size={14} color="#8888a0" />
            <Text className="text-sm text-text-secondary">
              {exerciseCount} exercises
            </Text>
          </View>
        </View>

        {/* Blocks & exercises */}
        <ScrollView className="flex-1 px-5 py-4">
          {template.blocks?.map((block, bi) => (
            <View key={block.id || bi} className="mb-5">
              <Text className="text-sm font-semibold text-text-primary mb-2">
                {block.name}
              </Text>
              <View className="gap-1.5">
                {block.exercises?.map((bex, ei) => {
                  const ex = bex.exercise;
                  const initials = (ex?.name ?? "EX")
                    .split(" ")
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <View
                      key={bex.id || ei}
                      className="flex-row items-center gap-3 rounded-xl bg-bg-card px-3 py-2.5"
                    >
                      {/* Initials avatar */}
                      <View className="h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                        <Text className="text-xs font-bold text-violet-400">
                          {initials}
                        </Text>
                      </View>

                      {/* Name + difficulty dot */}
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text
                            className="text-sm font-medium text-text-primary"
                            numberOfLines={1}
                          >
                            {ex?.name ?? "Exercise"}
                          </Text>
                          {ex && (
                            <View
                              className={`h-1.5 w-1.5 rounded-full ${
                                ex.difficulty === "beginner"
                                  ? "bg-emerald-400"
                                  : ex.difficulty === "intermediate"
                                    ? "bg-amber-400"
                                    : "bg-violet-400"
                              }`}
                            />
                          )}
                        </View>
                      </View>

                      {/* Duration / reps */}
                      <Text className="text-xs text-text-muted">
                        {bex.duration}s
                        {bex.reps ? ` / ${bex.reps} reps` : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View className="flex-row items-center justify-end gap-3 border-t border-border px-5 py-4">
          <TouchableOpacity
            className="flex-1 items-center rounded-xl border border-border py-3"
            onPress={onClose}
          >
            <Text className="text-sm font-medium text-text-secondary">
              Close
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-3"
            onPress={() => onUse(template)}
          >
            <Play size={14} color="#ffffff" />
            <Text className="text-sm font-medium text-white">
              Load into Builder
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
