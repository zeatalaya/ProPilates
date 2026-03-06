import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, ChevronLeft, Check } from "lucide-react-native";
import {
  MOBILE_METHODS,
  DIFFICULTIES,
  type PilatesMethod,
  type Difficulty,
} from "@propilates/shared";
import { useOnboardingStore } from "../../src/stores/onboarding";

const METHOD_DESCRIPTIONS: Record<string, string> = {
  mat: "Floor-based exercises using body weight",
  reformer: "Spring-based resistance training on the reformer machine",
  chair: "Compact equipment for seated and standing exercises",
  tower: "Wall-mounted springs for vertical resistance work",
  barrel: "Curved surfaces for spinal articulation and stretching",
  ring: "Flexible ring for added resistance to mat exercises",
  band: "Resistance band exercises for strength and flexibility",
  foam_roller: "Self-massage and balance work on a foam roller",
};

export default function PracticeScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [selectedMethods, setSelectedMethods] = useState<PilatesMethod[]>(
    store.methods,
  );
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>(
    store.difficulty,
  );

  const toggleMethod = (method: PilatesMethod) => {
    setSelectedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const canContinue = selectedMethods.length > 0 && selectedLevel.length > 0;

  const handleContinue = () => {
    store.setPractice(selectedMethods, selectedLevel);
    router.push("/(onboarding)/music");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-4">
          <Text className="text-sm font-medium text-violet-400 mb-1">
            Step 2 of 4
          </Text>
          <Text className="text-3xl font-bold text-text-primary mb-2">
            Your Practice
          </Text>
          <Text className="text-text-secondary text-base">
            Select the methods you teach and your expertise level.
          </Text>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">
            Methods You Teach
          </Text>
          <View className="gap-3">
            {MOBILE_METHODS.map((m) => {
              const isSelected = selectedMethods.includes(m.value);
              return (
                <TouchableOpacity
                  key={m.value}
                  className={`flex-row items-center border rounded-xl p-4 ${
                    isSelected
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-border bg-bg-card"
                  }`}
                  onPress={() => toggleMethod(m.value)}
                >
                  <View
                    className={`w-6 h-6 rounded-md border items-center justify-center mr-3 ${
                      isSelected
                        ? "bg-violet-600 border-violet-600"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check size={14} color="#fff" />}
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-medium text-base">
                      {m.label}
                    </Text>
                    <Text className="text-text-secondary text-sm mt-0.5">
                      {METHOD_DESCRIPTIONS[m.value] ?? ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-8 mb-8">
          <Text className="text-lg font-semibold text-text-primary mb-3">
            Teaching Level
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {DIFFICULTIES.map((d) => {
              const isSelected = selectedLevel === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  className={`border rounded-xl px-5 py-3 ${
                    isSelected
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-border bg-bg-card"
                  }`}
                  onPress={() => setSelectedLevel(d.value as Difficulty)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-violet-400" : "text-text-secondary"
                    }`}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
          className={`flex-1 flex-row items-center justify-center rounded-xl py-4 ${
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
    </SafeAreaView>
  );
}
