import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { ShieldCheck, ArrowRight, LogIn } from "lucide-react-native";
import { useAuthStore } from "@propilates/shared";
import { useAbstraxion } from "../../src/hooks/useAbstraxion";
import { supabase } from "../../src/lib/supabase";

export default function AuthScreen() {
  const {
    setInstructor,
    setLoading,
    xionAddress: storeAddress,
  } = useAuthStore();
  const { isConnected, isConnecting, isLoading, data, login } =
    useAbstraxion();

  // Use either native SDK address or auth store address (demo fallback)
  const resolvedAddress = data.bech32Address || storeAddress;
  const resolvedConnected = isConnected || !!storeAddress;

  // When connection completes, check Supabase and navigate
  useEffect(() => {
    if (!resolvedConnected || !resolvedAddress) return;

    const checkInstructor = async () => {
      try {
        setLoading(true);
        const { data: instructor } = await supabase
          .from("instructors")
          .select("*")
          .eq("xion_address", resolvedAddress)
          .maybeSingle();

        if (instructor) {
          setInstructor(instructor);
          router.replace("/(tabs)/builder");
        } else {
          router.replace("/(onboarding)/personal");
        }
      } catch {
        router.replace("/(onboarding)/personal");
      } finally {
        setLoading(false);
      }
    };

    checkInstructor();
  }, [resolvedConnected, resolvedAddress, setInstructor, setLoading]);

  const handleGetStarted = async () => {
    await login();
  };

  const handleLogIn = async () => {
    await login();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo — gold "P" with PILATES subtitle matching web SVG icon */}
        <View className="mb-2 items-center">
          <View className="mb-1 h-1 w-10 rounded-full bg-violet-500" />
          <View className="h-20 w-20 items-center justify-center rounded-2xl">
            <Text
              className="text-white"
              style={{ fontSize: 42, fontWeight: "300", fontFamily: "Georgia" }}
            >
              P
            </Text>
          </View>
          <Text
            className="text-violet-400"
            style={{
              fontSize: 8,
              fontWeight: "300",
              letterSpacing: 4,
            }}
          >
            PILATES
          </Text>
        </View>

        <Text className="mb-1 text-3xl font-bold text-text-primary">
          ProPilates
        </Text>
        <Text className="mb-2 text-lg text-violet-400">
          Your Pilates Studio, Elevated
        </Text>
        <Text className="mb-10 text-center text-text-secondary">
          Build classes with 150+ exercises. Teach with live timers and Spotify.
          Monetize your expertise through digital portfolios.
        </Text>

        {/* Badge */}
        <View className="mb-8 flex-row items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2">
          <ShieldCheck size={14} color="#c9a96e" />
          <Text className="text-sm text-violet-400">
            Professional Pilates Platform
          </Text>
        </View>

        {/* Get Started (primary) */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className={`mb-3 w-full flex-row items-center justify-center gap-2 rounded-xl px-6 py-4 ${
            isConnecting || isLoading ? "bg-violet-600/50" : "bg-violet-600"
          }`}
          activeOpacity={0.8}
          disabled={isConnecting || isLoading}
        >
          {isConnecting || isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-lg font-semibold text-white">
                Connecting...
              </Text>
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold text-white">
                Get Started
              </Text>
              <ArrowRight size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Log In (secondary) */}
        <TouchableOpacity
          onPress={handleLogIn}
          className="mb-3 w-full flex-row items-center justify-center gap-2 rounded-xl border border-border bg-bg-elevated px-6 py-4"
          activeOpacity={0.8}
          disabled={isConnecting || isLoading}
        >
          <LogIn size={18} color="#c9a96e" />
          <Text className="text-lg font-semibold text-text-primary">
            Log In
          </Text>
        </TouchableOpacity>

        {/* Try Builder (ghost) */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/builder")}
          className="w-full items-center rounded-xl px-6 py-3"
          activeOpacity={0.8}
        >
          <Text className="text-base font-medium text-text-secondary">
            Try Class Builder
          </Text>
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs text-text-muted">
          Sign in with email, Google, or passkey via XION Meta Account
        </Text>
      </View>
    </SafeAreaView>
  );
}
