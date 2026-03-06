import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, ChevronLeft, Music, Check } from "lucide-react-native";
import { useSpotifyStore } from "@propilates/shared";

export default function MusicScreen() {
  const router = useRouter();
  const isReady = useSpotifyStore((s) => s.isReady);

  const handleContinue = () => {
    router.push("/(onboarding)/confirmation");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-4">
          <Text className="text-sm font-medium text-violet-400 mb-1">
            Step 3 of 4
          </Text>
          <Text className="text-3xl font-bold text-text-primary mb-2">
            Music
          </Text>
          <Text className="text-text-secondary text-base">
            Connect Spotify to play music during your classes. Works with free
            and premium accounts.
          </Text>
        </View>

        <View className="mt-8 items-center">
          <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-6">
            <Music size={36} color="#34d399" />
          </View>

          {isReady ? (
            <View className="items-center">
              <View className="flex-row items-center mb-2">
                <Check size={20} color="#34d399" />
                <Text className="text-emerald-400 text-lg font-semibold ml-2">
                  Spotify Connected
                </Text>
              </View>
              <Text className="text-text-secondary text-center">
                Your Spotify account is linked. You can control music playback
                during teaching sessions.
              </Text>
            </View>
          ) : (
            <View className="items-center w-full">
              <Text className="text-text-primary text-lg font-semibold mb-2">
                Enhance Your Classes
              </Text>
              <Text className="text-text-secondary text-center mb-6">
                Connect your Spotify account to control music playback directly
                from the teaching screen. Works with both free and premium
                accounts.
              </Text>

              <View className="w-full gap-3">
                <View className="flex-row items-start gap-3 px-4">
                  <View className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <Text className="text-text-secondary flex-1">
                    Control playback without leaving the app
                  </Text>
                </View>
                <View className="flex-row items-start gap-3 px-4">
                  <View className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <Text className="text-text-secondary flex-1">
                    Browse your playlists and liked songs
                  </Text>
                </View>
                <View className="flex-row items-start gap-3 px-4">
                  <View className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <Text className="text-text-secondary flex-1">
                    Works with Spotify Free — no premium required
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="flex-row px-6 pb-6 gap-3">
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-xl py-4 px-6 border border-border"
          onPress={() => router.back()}
        >
          <ChevronLeft size={18} color="#a0a0b8" />
          <Text className="text-text-secondary font-semibold ml-1">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-xl py-4 bg-violet-600"
          onPress={handleContinue}
        >
          <Text className="text-white text-base font-semibold mr-2">
            {isReady ? "Continue" : "Skip for Now"}
          </Text>
          <ChevronRight size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
