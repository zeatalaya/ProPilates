import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { useOnboardingStore } from "../../src/stores/onboarding";

export default function PersonalScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [name, setName] = useState(store.name);
  const [bio, setBio] = useState(store.bio);
  const [location, setLocation] = useState(store.location);

  const canContinue = name.trim().length > 0;

  const handleContinue = () => {
    store.setPersonal(name.trim(), bio.trim(), location.trim());
    router.push("/(onboarding)/practice");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          <View className="mt-8 mb-4">
            <Text className="text-sm font-medium text-violet-400 mb-1">
              Step 1 of 4
            </Text>
            <Text className="text-3xl font-bold text-text-primary mb-2">
              About You
            </Text>
            <Text className="text-text-secondary text-base">
              Tell us a bit about yourself so we can personalize your experience.
            </Text>
          </View>

          <View className="mt-6 gap-5">
            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2">
                Full Name *
              </Text>
              <TextInput
                className="bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary text-base"
                placeholder="Enter your name"
                placeholderTextColor="#55556a"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2">
                Bio
              </Text>
              <TextInput
                className="bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary text-base"
                placeholder="Brief description about yourself"
                placeholderTextColor="#55556a"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-text-secondary mb-2">
                Location
              </Text>
              <TextInput
                className="bg-bg-card border border-border rounded-xl px-4 py-3 text-text-primary text-base"
                placeholder="City, Country"
                placeholderTextColor="#55556a"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-xl py-4 ${
              canContinue ? "bg-violet-600" : "bg-violet-600/30"
            }`}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text
              className={`text-base font-semibold mr-2 ${
                canContinue ? "text-white" : "text-white/40"
              }`}
            >
              Continue
            </Text>
            <ChevronRight size={18} color={canContinue ? "#fff" : "#ffffff66"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
