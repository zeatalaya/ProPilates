import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { formatDuration, DURATION_PRESETS } from "@propilates/shared";
import { cn } from "../../lib/cn";

interface DurationPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function DurationPicker({ value, onChange }: DurationPickerProps) {
  const step = 5;
  const min = 5;
  const max = 300;

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-text-secondary">
        Duration
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {DURATION_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset}
            onPress={() => onChange(preset)}
            className={cn(
              "rounded-lg border px-3 py-1.5",
              value === preset
                ? "border-violet-500 bg-violet-500/20"
                : "border-border bg-bg-elevated",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                value === preset ? "text-violet-400" : "text-text-secondary",
              )}
            >
              {preset}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - step))}
          className="rounded-lg border border-border bg-bg-elevated p-2"
        >
          <Minus size={18} color="#8888a0" />
        </TouchableOpacity>
        <Text className="min-w-[60px] text-center text-xl font-bold text-text-primary">
          {formatDuration(value)}
        </Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + step))}
          className="rounded-lg border border-border bg-bg-elevated p-2"
        >
          <Plus size={18} color="#8888a0" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
