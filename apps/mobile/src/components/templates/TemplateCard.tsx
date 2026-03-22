import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Layers, Dumbbell, Eye, Play } from "lucide-react-native";
import { Card, CardBody } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { PilatesClass } from "@propilates/shared";
import { useThemeColors } from "../../lib/theme";

const METHOD_BADGE: Record<string, "violet" | "blue" | "emerald"> = {
  mat: "violet",
  reformer: "blue",
  "x-reformer": "emerald",
};

const DIFFICULTY_BADGE: Record<string, "emerald" | "amber" | "violet"> = {
  beginner: "emerald",
  intermediate: "amber",
  advanced: "violet",
};

interface Props {
  template: PilatesClass;
  onPreview: (template: PilatesClass) => void;
  onUse: (template: PilatesClass) => void;
}

export function TemplateCard({ template, onPreview, onUse }: Props) {
  const colors = useThemeColors();
  const blockCount = template.blocks?.length ?? 0;
  const exerciseCount =
    template.blocks?.reduce(
      (sum, b) => sum + (b.exercises?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <Card className="mb-4">
      <CardBody>
        {/* Method badge */}
        <View className="mb-2">
          <Badge variant={METHOD_BADGE[template.method] ?? "violet"}>
            {template.method}
          </Badge>
        </View>

        {/* Title & description */}
        <Text className="text-base font-semibold text-text-primary mb-1">
          {template.title}
        </Text>
        <Text
          className="text-sm text-text-secondary mb-3"
          numberOfLines={2}
        >
          {template.description}
        </Text>

        {/* Stats row */}
        <View className="flex-row items-center gap-4 mb-3">
          <View className="flex-row items-center gap-1">
            <Clock size={14} color={colors.textMuted} />
            <Text className="text-xs text-text-secondary">
              {template.duration_minutes}min
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Layers size={14} color={colors.textMuted} />
            <Text className="text-xs text-text-secondary">
              {blockCount} blocks
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Dumbbell size={14} color={colors.textMuted} />
            <Text className="text-xs text-text-secondary">
              {exerciseCount} exercises
            </Text>
          </View>
        </View>

        {/* Difficulty badge */}
        <View className="mb-4">
          <Badge variant={DIFFICULTY_BADGE[template.difficulty] ?? "gray"}>
            {template.difficulty}
          </Badge>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-card py-3"
            onPress={() => onPreview(template)}
          >
            <Eye size={14} color={colors.textSecondary} />
            <Text className="text-sm font-medium text-text-secondary">
              Preview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-3"
            onPress={() => onUse(template)}
          >
            <Play size={14} color="#ffffff" />
            <Text className="text-sm font-medium text-white">
              Use Template
            </Text>
          </TouchableOpacity>
        </View>
      </CardBody>
    </Card>
  );
}
