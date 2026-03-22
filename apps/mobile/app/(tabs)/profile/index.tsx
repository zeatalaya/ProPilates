import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  User,
  Shield,
  Settings,
  Music,
  Copy,
  CheckCircle,
} from "lucide-react-native";
import { useAuthStore, useSpotifyStore } from "@propilates/shared";
import { truncateAddress } from "@propilates/shared";
import { useSpotifyMobile } from "../../../src/hooks/useSpotifyMobile";
import { useUsdcBalance } from "../../../src/hooks/useBalance";
import { BalanceDisplay } from "../../../src/components/ui/BalanceDisplay";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { useThemeColors } from "../../../src/lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { xionAddress, instructor, isConnected } = useAuthStore();
  const { accessToken: spotifyAccessToken } = useSpotifyStore();
  const spotify = useSpotifyMobile();
  const { balance, isLoading: balanceLoading } = useUsdcBalance(xionAddress);
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = async () => {
    if (xionAddress) {
      await Clipboard.setStringAsync(xionAddress);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <User size={36} color={colors.accent} />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            Not Connected
          </Text>
          <Text className="text-text-secondary text-center mb-6">
            Sign in to view your profile and manage your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-4 pb-6">
          <Text className="text-2xl font-bold text-text-primary mb-6">
            Profile
          </Text>

          {/* Avatar + Info */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-violet-500/20 items-center justify-center mb-4">
              <User size={40} color={colors.accent} />
            </View>
            <Text className="text-xl font-bold text-text-primary">
              {instructor?.name || "Instructor"}
            </Text>

            {/* Address */}
            {xionAddress && (
              <TouchableOpacity
                className="flex-row items-center mt-2"
                onPress={handleCopyAddress}
              >
                <View className="flex-row items-center bg-bg-card border border-border rounded-full px-3 py-1.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-text-secondary text-sm font-mono mr-2">
                    {truncateAddress(xionAddress)}
                  </Text>
                  {copied ? (
                    <CheckCircle size={14} color={colors.success} />
                  ) : (
                    <Copy size={14} color={colors.textMuted} />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Balance */}
            <View className="mt-3">
              <BalanceDisplay balance={balance} isLoading={balanceLoading} />
            </View>
          </View>
        </View>

        {/* Certifications */}
        <Card className="mb-4">
          <CardBody>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-text-primary font-semibold">
                Certifications
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile/verify")}
              >
                <Text className="text-violet-400 text-sm font-medium">
                  Verify
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="gray">No certifications yet</Badge>
            </View>
          </CardBody>
        </Card>

        {/* Methods */}
        <Card className="mb-4">
          <CardBody>
            <Text className="text-text-primary font-semibold mb-3">
              Teaching Methods
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {instructor?.methods?.map((m) => (
                <Badge key={m} variant="violet">
                  {m}
                </Badge>
              )) ?? <Badge variant="gray">None set</Badge>}
            </View>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <View className="gap-3 mb-8">
          <TouchableOpacity
            className="flex-row items-center bg-bg-card border border-border rounded-xl px-4 py-4"
            onPress={() => router.push("/(tabs)/profile/verify")}
          >
            <Shield size={20} color={colors.accent} />
            <Text className="text-text-primary font-medium ml-3 flex-1">
              Verify Credentials
            </Text>
            <Text className="text-text-secondary text-sm">Verified</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-bg-card border border-border rounded-xl px-4 py-4"
            onPress={() => {
              if (spotifyAccessToken) {
                useSpotifyStore.getState().reset();
              } else {
                spotify.login();
              }
            }}
          >
            <Music size={20} color={colors.success} />
            <Text className="text-text-primary font-medium ml-3 flex-1">
              Spotify
            </Text>
            <Text className="text-violet-400 text-sm font-medium">
              {spotifyAccessToken ? "Disconnect" : "Connect"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-bg-card border border-border rounded-xl px-4 py-4"
            onPress={() => router.push("/(tabs)/profile/settings")}
          >
            <Settings size={20} color={colors.textSecondary} />
            <Text className="text-text-primary font-medium ml-3 flex-1">
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
