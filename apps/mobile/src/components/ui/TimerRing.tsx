import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { formatDuration } from "@propilates/shared";

interface TimerRingProps {
  progress: number;
  elapsed: number;
  duration: number;
  size?: number;
}

export function TimerRing({
  progress,
  elapsed,
  duration,
  size = 200,
}: TimerRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const remaining = Math.max(0, duration - elapsed);

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2a2a3a"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8257e5"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-4xl font-bold text-text-primary">
          {formatDuration(remaining)}
        </Text>
        <Text className="text-sm text-text-muted">remaining</Text>
      </View>
    </View>
  );
}
