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
import { useOAuth3Mobile } from "../../src/hooks/useOAuth3Mobile";
import { supabase, isSupabaseConfigured } from "../../src/lib/supabase";

export default function ConfirmationScreen() {
  const router = useRouter();
  const { xionAddress, setInstructor, isConnected } = useAuthStore();
  const onboarding = useOnboardingStore();
  const { login, isAuthenticating } = useOAuth3Mobile();
  const [saving, setSaving] = useState(false);

  const saveProfile = async (address: string) => {
    if (!isSupabaseConfigured) return;
    const { data: instructor, error } = await supabase
      .from("instructors")
      .upsert(
        {
          xion_address: address,
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
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // If not authenticated yet, trigger OAuth first
      let address = xionAddress;
      if (!isConnected || !address) {
        try {
          await login();
          // After login, get the updated address from the store
          address = useAuthStore.getState().xionAddress;
          if (!address) {
            Alert.alert(
              "Auth Required",
              "Please sign in to save your profile.",
            );
            setSaving(false);
            return;
          }
        } catch {
          Alert.alert(
            "Auth Failed",
            "Could not authenticate. Your profile will be saved when you sign in.",
          );
          router.replace("/(tabs)/builder");
          return;
        }
      }

      await saveProfile(address);
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
          className={`flex-row items-center justify-center rounded-xl py-4 ${
            saving || isAuthenticating ? "bg-violet-600/50" : "bg-violet-600"
          }`}
          onPress={handleFinish}
          disabled={saving || isAuthenticating}
        >
          {saving || isAuthenticating ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                {isAuthenticating ? "Authenticating..." : "Saving..."}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-white text-base font-semibold mr-2">
                {isConnected ? "Start Building" : "Sign In & Start"}
              </Text>
              <ArrowRight size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
