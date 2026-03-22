import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { formatUsdc } from "@propilates/shared";
import { useThemeColors } from "../../lib/theme";

interface BalanceDisplayProps {
  balance: number | null;
  isLoading: boolean;
}

export function BalanceDisplay({ balance, isLoading }: BalanceDisplayProps) {
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View className="flex-row items-center gap-2">
        <ActivityIndicator size="small" color={colors.accent} />
        <Text className="text-text-muted text-sm">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-baseline gap-1">
      <Text className="text-2xl font-bold text-text-primary">
        ${balance !== null ? formatUsdc(balance) : "\u2014"}
      </Text>
      <Text className="text-sm text-text-secondary">USDC</Text>
    </View>
  );
}
