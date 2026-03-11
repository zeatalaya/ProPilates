import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle, ArrowRight } from "lucide-react-native";
import { useAuthStore } from "@propilates/shared";
import { useOnboardingStore } from "../../src/stores/onboarding";
import { supabase, isSupabaseConfigured } from "../../src/lib/supabase";

export default function ConfirmationScreen() {
  const router = useRouter();
  const { xionAddress, setInstructor } = useAuthStore();
  const onboarding = useOnboardingStore();
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (isSupabaseConfigured && xionAddress) {
        const { data: instructor, error } = await supabase
          .from("instructors")
          .upsert(
            {
              xion_address: xionAddress,
              name: onboarding.name,
              bio: onboarding.bio,
              location: onboarding.location,
              methods: onboarding.methods,
              tier: "free",
              onboarding_complete: true,
            },
            { onConflict: "xion_address" },
          )
          .select()
          .single();

        if (error) throw error;
        if (instructor) setInstructor(instructor);
      }
      onboarding.reset();
      router.replace("/(tabs)/builder");
    } catch {
      Alert.alert(
        "Save Error",
        "Could not save your profile. You can update it later in settings.",
      );
      router.replace("/(tabs)/builder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-emerald-500/20 items-center justify-center mb-8">
          <CheckCircle size={48} color="#34d399" />
        </View>

        <Text className="text-sm font-medium text-violet-400 mb-2">
          Step 4 of 4
        </Text>
        <Text className="text-3xl font-bold text-text-primary mb-3 text-center">
          You're All Set!
        </Text>
        <Text className="text-text-secondary text-base text-center mb-8 px-4">
          Your profile is ready. Start building classes, teach live sessions, and
          explore the marketplace.
        </Text>

        <View className="w-full gap-4 mb-8">
          <View className="flex-row items-center bg-bg-card border border-border rounded-xl p-4">
            <View className="w-10 h-10 rounded-full bg-violet-500/20 items-center justify-center mr-3">
              <Text className="text-violet-400 font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-medium">
                Build a Class
              </Text>
              <Text className="text-text-secondary text-sm">
                Create your first Pilates class with exercises and timing
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-bg-card border border-border rounded-xl p-4">
            <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
              <Text className="text-emerald-400 font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-medium">
                Teach a Session
              </Text>
              <Text className="text-text-secondary text-sm">
                Use the timer and cues to guide your class
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-bg-card border border-border rounded-xl p-4">
            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
              <Text className="text-blue-400 font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-medium">
                Sell on Marketplace
              </Text>
              <Text className="text-text-secondary text-sm">
                List your classes as NFTs and earn USDC
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 pb-6">
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-xl py-4 bg-violet-600"
          onPress={handleFinish}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text className="text-white text-base font-semibold mr-2">
                Start Building
              </Text>
              <ArrowRight size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
