import React from "react";
import { View, Text } from "react-native";

type Variant = "violet" | "emerald" | "blue" | "gray" | "red" | "amber";

const variantBgColors: Record<Variant, string> = {
  violet: "#8A7E7220",
  emerald: "#7D9B7620",
  blue: "#7B8FA220",
  gray: "#9E979020",
  red: "#C67B6B20",
  amber: "#B5996E20",
};

const variantTextColors: Record<Variant, string> = {
  violet: "#6E6358",
  emerald: "#5A7A53",
  blue: "#5C7088",
  gray: "#7A7268",
  red: "#A8584A",
  amber: "#96773A",
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
