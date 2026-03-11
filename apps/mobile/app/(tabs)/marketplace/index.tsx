import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, ShoppingBag } from "lucide-react-native";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { MOBILE_METHODS } from "@propilates/shared";

interface Listing {
  tokenId: string;
  name: string;
  instructor: string;
  method: string;
  difficulty: string;
  price: number;
  exerciseCount: number;
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [listings] = useState<Listing[]>([]);
  const [loading] = useState(false);

  const filtered = listings.filter((l) => {
    const matchesSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = !filterMethod || l.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const filterOptions: { value: string | null; label: string }[] = [
    { value: null, label: "All" },
    ...MOBILE_METHODS.map((m) => ({ value: m.value as string | null, label: m.label })),
  ];

  const renderListing = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      className="mb-3"
      onPress={() => router.push(`/(tabs)/marketplace/${item.tokenId}`)}
    >
      <Card>
        <CardBody>
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-text-primary font-semibold text-base">
                {item.name}
              </Text>
              <Text className="text-text-secondary text-sm mt-0.5">
                by {item.instructor}
              </Text>
            </View>
            <Text className="text-emerald-400 font-bold text-lg">
              ${(item.price / 1_000_000).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mt-2">
            <Badge variant="violet">{item.method}</Badge>
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
        <Text className="text-2xl font-bold text-text-primary mb-4">
          Marketplace
        </Text>

        {/* Search */}
        <View className="flex-row items-center bg-bg-card border border-border rounded-xl px-4 py-3 mb-3">
          <Search size={18} color="#55556a" />
          <TextInput
            className="flex-1 text-text-primary text-base ml-3"
            placeholder="Search classes..."
            placeholderTextColor="#55556a"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Method Filters */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.value ?? "all"}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full border ${
                filterMethod === item.value
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-border bg-bg-card"
              }`}
              onPress={() => setFilterMethod(item.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  filterMethod === item.value
                    ? "text-violet-400"
                    : "text-text-secondary"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Listings */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#c9a96e" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <ShoppingBag size={36} color="#c9a96e" />
          </View>
          <Text className="text-text-primary text-lg font-semibold mb-2">
            No Listings Found
          </Text>
          <Text className="text-text-secondary text-center">
            Classes listed on the marketplace will appear here. Check back soon
            or list your own classes!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderListing}
          keyExtractor={(item) => item.tokenId}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
