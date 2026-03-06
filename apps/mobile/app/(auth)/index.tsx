import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Zap } from "lucide-react-native";
import { useAuthStore } from "@propilates/shared";
import { useAbstraxion } from "../../src/hooks/useAbstraxion";
import { supabase } from "../../src/lib/supabase";

export default function AuthScreen() {
  const { setInstructor, setLoading } = useAuthStore();
  const { isConnected, isConnecting, isLoading, data, login } =
    useAbstraxion();

  // When connection completes, check Supabase and navigate
  useEffect(() => {
    if (!isConnected || !data.bech32Address) return;

    const checkInstructor = async () => {
      try {
        setLoading(true);
        const { data: instructor } = await supabase
          .from("instructors")
          .select("*")
          .eq("xion_address", data.bech32Address)
          .maybeSingle();

        if (instructor) {
          setInstructor(instructor);
          router.replace("/(tabs)/builder");
        } else {
          router.replace("/(onboarding)/personal");
        }
      } catch {
        // If Supabase fails, still navigate to onboarding
        router.replace("/(onboarding)/personal");
      } finally {
        setLoading(false);
      }
    };

    checkInstructor();
  }, [isConnected, data.bech32Address, setInstructor, setLoading]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (err) {
      Alert.alert("Connection Error", "Failed to connect. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="mb-8 h-20 w-20 items-center justify-center rounded-2xl bg-violet-600">
          <Text className="text-3xl font-bold text-white">P</Text>
        </View>

        <Text className="mb-2 text-3xl font-bold text-text-primary">
          ProPilates
        </Text>
        <Text className="mb-2 text-lg text-violet-400">
          Your Pilates Studio, On-Chain
        </Text>
        <Text className="mb-12 text-center text-text-secondary">
          Build classes with 150+ exercises. Teach with live timers and
          Spotify. Monetize through blockchain portfolios.
        </Text>

        {/* XION badge */}
        <View className="mb-6 flex-row items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2">
          <Zap size={14} color="#8257e5" />
          <Text className="text-sm text-violet-400">
            Powered by XION Blockchain
          </Text>
        </View>

        {/* Connect button */}
        <TouchableOpacity
          onPress={handleConnect}
          className={`w-full rounded-xl px-6 py-4 ${
            isConnecting || isLoading ? "bg-violet-600/50" : "bg-violet-600"
          }`}
          activeOpacity={0.8}
          disabled={isConnecting || isLoading}
        >
          {isConnecting || isLoading ? (
            <View className="flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-lg font-semibold text-white">
                Connecting...
              </Text>
            </View>
          ) : (
            <Text className="text-center text-lg font-semibold text-white">
              Connect with XION
            </Text>
          )}
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs text-text-muted">
          Sign in with email, Google, or passkey via XION Meta Account
        </Text>
      </View>
    </SafeAreaView>
  );
}
