import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Briefcase, Plus, Layers } from "lucide-react-native";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";

type Tab = "built" | "purchased";

interface ClassItem {
  id: string;
  name: string;
  method: string;
  difficulty: string;
  exerciseCount: number;
  createdAt: string;
}

const METHOD_LABELS: Record<string, string> = {
  reformer: "Reformer",
  "x-reformer": "x-Reformer",
  mat: "Mat",
};

export default function PortfolioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("built");
  const [myClasses] = useState<ClassItem[]>([]);
  const [purchased] = useState<ClassItem[]>([]);
  const [loading] = useState(false);

  const items = activeTab === "built" ? myClasses : purchased;

  const renderItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity className="mb-3">
      <Card>
        <CardBody>
          <Text className="text-text-primary font-semibold text-base mb-1">
            {item.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Badge variant="violet">
              {METHOD_LABELS[item.method] ?? item.method}
            </Badge>
            <Badge variant="blue">{item.difficulty}</Badge>
            <Text className="text-text-secondary text-xs ml-auto">
              {item.exerciseCount} exercises
            </Text>
          </View>
        </CardBody>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-text-primary">
            Portfolio
          </Text>
          <TouchableOpacity
            className="flex-row items-center bg-violet-600 rounded-xl px-4 py-2"
            onPress={() => router.push("/(tabs)/builder")}
          >
            <Plus size={16} color="#fff" />
            <Text className="text-white font-medium ml-1 text-sm">
              New Class
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-bg-card border border-border rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === "built" ? "bg-violet-600" : ""
            }`}
            onPress={() => setActiveTab("built")}
          >
            <Text
              className={`font-medium text-sm ${
                activeTab === "built" ? "text-white" : "text-text-secondary"
              }`}
            >
              My Classes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === "purchased" ? "bg-violet-600" : ""
            }`}
            onPress={() => setActiveTab("purchased")}
          >
            <Text
              className={`font-medium text-sm ${
                activeTab === "purchased" ? "text-white" : "text-text-secondary"
              }`}
            >
              Purchased
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#c9a96e" />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            {activeTab === "built" ? (
              <Layers size={36} color="#c9a96e" />
            ) : (
              <Briefcase size={36} color="#c9a96e" />
            )}
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            {activeTab === "built" ? "No Classes Yet" : "No Purchases Yet"}
          </Text>
          <Text className="text-text-secondary text-center">
            {activeTab === "built"
              ? "Start building your first Pilates class in the Builder tab."
              : "Classes you purchase from the marketplace will appear here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
