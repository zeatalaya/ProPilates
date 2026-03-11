import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  LogOut,
  Music,
  Wallet,
  Globe,
  Info,
  ChevronRight,
} from "lucide-react-native";
import { useAuthStore, useSpotifyStore } from "@propilates/shared";
import { useAbstraxion } from "../../../src/hooks/useAbstraxion";
import { Card, CardBody } from "../../../src/components/ui/Card";

export default function SettingsScreen() {
  const router = useRouter();
  const { reset: authReset, xionAddress } = useAuthStore();
  const { logout: abstraxionLogout } = useAbstraxion();
  const spotifyReady = useSpotifyStore((s) => s.isReady);
  const spotifyReset = useSpotifyStore((s) => s.reset);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          abstraxionLogout();
          authReset();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  const handleSpotifyToggle = () => {
    if (spotifyReady) {
      spotifyReset();
    }
    // If not ready, trigger connect flow from useSpotifyMobile hook
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#a0a0b8" />
        </TouchableOpacity>
        <Text className="text-text-primary font-semibold text-lg flex-1">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Account */}
        <View className="mt-6 mb-2">
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">
            Account
          </Text>
        </View>

        <Card className="mb-6">
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-border">
            <Wallet size={20} color="#c9a96e" />
            <View className="flex-1 ml-3">
              <Text className="text-text-primary font-medium">
                XION Wallet
              </Text>
              <Text className="text-text-secondary text-sm">
                {xionAddress ? "Connected" : "Not connected"}
              </Text>
            </View>
            <ChevronRight size={18} color="#55556a" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleSpotifyToggle}
          >
            <Music size={20} color="#34d399" />
            <View className="flex-1 ml-3">
              <Text className="text-text-primary font-medium">Spotify</Text>
              <Text className="text-text-secondary text-sm">
                {spotifyReady ? "Connected" : "Not connected"}
              </Text>
            </View>
            <Text className="text-violet-400 text-sm font-medium">
              {spotifyReady ? "Disconnect" : "Connect"}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* General */}
        <View className="mb-2">
          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-3">
            General
          </Text>
        </View>

        <Card className="mb-6">
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-border">
            <Globe size={20} color="#a0a0b8" />
            <Text className="text-text-primary font-medium ml-3 flex-1">
              Network
            </Text>
            <Text className="text-text-secondary text-sm">XION Testnet-2</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-4 py-4">
            <Info size={20} color="#a0a0b8" />
            <Text className="text-text-primary font-medium ml-3 flex-1">
              About
            </Text>
            <Text className="text-text-secondary text-sm">v1.0.0</Text>
          </TouchableOpacity>
        </Card>

        {/* Sign Out */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-red-500/10 border border-red-500/30 rounded-xl py-4 mb-8"
          onPress={handleLogout}
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-red-400 font-semibold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
