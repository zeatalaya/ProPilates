import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ShieldCheck, ArrowRight, LogIn } from "lucide-react-native";
import { useAuthStore } from "@propilates/shared";
import { useOAuth3Mobile } from "../../src/hooks/useOAuth3Mobile";
import { supabase } from "../../src/lib/supabase";

export default function AuthScreen() {
  const { setInstructor, setLoading, setTier } = useAuthStore();
  const {
    isAuthenticated,
    isInitialized,
    isAuthenticating,
    login,
    xionAddress,
  } = useOAuth3Mobile();

  // If already authenticated (session restored), check profile and navigate
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !xionAddress) return;

    const checkAndNavigate = async () => {
      try {
        setLoading(true);
        const { data: instructor } = await supabase
          .from("instructors")
          .select("*")
          .eq("xion_address", xionAddress)
          .maybeSingle();

        if (instructor) {
          setInstructor(instructor);
          // Restore tier
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("tier")
            .eq("instructor_id", instructor.id)
            .eq("status", "active")
            .maybeSingle();
          if (sub?.tier) setTier(sub.tier);
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

    checkAndNavigate();
  }, [isInitialized, isAuthenticated, xionAddress, setInstructor, setLoading, setTier]);

  // "Log In" — OAuth immediately, then check Supabase for existing profile
  const handleLogIn = async () => {
    try {
      await login();
      // After login completes, the useEffect above will handle navigation
    } catch {
      Alert.alert(
        "Login Failed",
        "Could not connect to XION. Please try again.",
      );
    }
  };

  // "Get Started" — go to onboarding first, OAuth happens at confirmation
  const handleGetStarted = () => {
    router.push("/(onboarding)/personal");
  };

  // Show loading while restoring session
  if (!isInitialized) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#c9a96e" />
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Get Started (primary) — goes to onboarding */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className="mb-3 w-full flex-row items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-4"
          activeOpacity={0.8}
          disabled={isAuthenticating}
        >
          <Text className="text-lg font-semibold text-white">
            Get Started
          </Text>
          <ArrowRight size={18} color="#fff" />
        </TouchableOpacity>

        {/* Log In (secondary) — OAuth immediately */}
        <TouchableOpacity
          onPress={handleLogIn}
          className={`mb-3 w-full flex-row items-center justify-center gap-2 rounded-xl border border-border px-6 py-4 ${
            isAuthenticating ? "bg-bg-elevated/50" : "bg-bg-elevated"
          }`}
          activeOpacity={0.8}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <>
              <ActivityIndicator size="small" color="#c9a96e" />
              <Text className="text-lg font-semibold text-text-primary">
                Connecting...
              </Text>
            </>
          ) : (
            <>
              <LogIn size={18} color="#c9a96e" />
              <Text className="text-lg font-semibold text-text-primary">
                Log In
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="mt-4 text-center text-xs text-text-muted">
          Sign in with email, Google, or passkey via XION Meta Account
        </Text>
      </View>
    </SafeAreaView>
  );
}
