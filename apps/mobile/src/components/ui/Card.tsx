import React from "react";
import { View } from "react-native";
import { useThemeColors } from "../../lib/theme";
import { cn } from "../../lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        overflow: "hidden",
      }}
      className={className}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <View className={cn("px-4 py-3", className)}>
      {children}
    </View>
  );
}

export function CardBody({ children, className }: CardProps) {
  return (
    <View style={{ padding: 16 }} className={className}>
      {children}
    </View>
  );
}
