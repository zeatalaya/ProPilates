import React from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-border bg-bg-card overflow-hidden",
        className,
      )}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <View className={cn("border-b border-border px-4 py-3", className)}>
      {children}
    </View>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <View className={cn("px-4 py-4", className)}>{children}</View>;
}
