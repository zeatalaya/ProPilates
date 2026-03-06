import React from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/cn";

type Variant = "violet" | "emerald" | "blue" | "gray" | "red";

const variantStyles: Record<Variant, string> = {
  violet: "bg-violet-500/20 border-violet-500/30",
  emerald: "bg-emerald-500/20 border-emerald-500/30",
  blue: "bg-blue-500/20 border-blue-500/30",
  gray: "bg-gray-500/20 border-gray-500/30",
  red: "bg-red-500/20 border-red-500/30",
};

const textStyles: Record<Variant, string> = {
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  gray: "text-gray-400",
  red: "text-red-400",
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "violet", children, className }: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center rounded-full border px-2 py-0.5",
        variantStyles[variant],
        className,
      )}
    >
      <Text className={cn("text-xs font-medium capitalize", textStyles[variant])}>
        {children}
      </Text>
    </View>
  );
}
