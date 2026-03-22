import React from "react";
import { View, Text } from "react-native";

type Variant = "violet" | "emerald" | "blue" | "gray" | "red" | "amber";

const variantBgColors: Record<Variant, string> = {
  violet: "#8B5CF620",
  emerald: "#10B98120",
  blue: "#3B82F620",
  gray: "#6B728020",
  red: "#EF444420",
  amber: "#F5920020",
};

const variantTextColors: Record<Variant, string> = {
  violet: "#7C3AED",
  emerald: "#059669",
  blue: "#2563EB",
  gray: "#6B7280",
  red: "#DC2626",
  amber: "#D97706",
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
}

export function Badge({ variant = "violet", children }: BadgeProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: variantBgColors[variant],
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color: variantTextColors[variant],
        }}
      >
        {children}
      </Text>
    </View>
  );
}
