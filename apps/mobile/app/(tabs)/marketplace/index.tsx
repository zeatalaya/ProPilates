import React, { useEffect, useState } from "react";
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
import { supabase } from "../../../src/lib/supabase";
import { useThemeColors } from "../../../src/lib/theme";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  method: string;
  difficulty: string;
  duration_minutes: number;
  price: number | null;
  instructor_name: string;
  instructor_id: string;
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("*, instructor:instructors(name)")
          .eq("is_public", true)
          .not("price", "is", null)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setListings(
            data.map((c: any) => ({
              id: c.id,
              title: c.title,
              description: c.description || "",
              method: c.method,
              difficulty: c.difficulty,
              duration_minutes: c.duration_minutes,
              price: c.price,
              instructor_name: c.instructor?.name || "Unknown",
              instructor_id: c.instructor_id,
            })),
          );
        }
      } catch {
        // Silently fail — show empty state
      }
      setLoading(false);
    }
    loadListings();
  }, []);

  const filtered = listings.filter((l) => {
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.instructor_name.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = !filterMethod || l.method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const filterOptions: { value: string | null; label: string }[] = [
    { value: null, label: "All" },
    ...MOBILE_METHODS.map((m) => ({ value: m.value as string | null, label: m.label })),
  ];

  const renderListing = ({ item }: { item: MarketplaceListing }) => (
    <TouchableOpacity
      className="mb-3"
      onPress={() => router.push(`/(tabs)/marketplace/${item.id}`)}
    >
      <Card>
        <CardBody>
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-text-primary font-semibold text-base">
                {item.title}
              </Text>
              <Text className="text-text-secondary text-sm mt-0.5">
                by {item.instructor_name}
              </Text>
            </View>
            {item.price != null && (
              <Text className="text-emerald-400 font-bold text-lg">
                ${Number(item.price).toFixed(2)}
              </Text>
            )}
          </View>
          {item.description ? (
            <Text className="text-text-muted text-sm mb-2" numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-2 mt-1">
            <Badge variant="violet">{item.method}</Badge>
            <Badge variant="blue">{item.difficulty}</Badge>
            <Text className="text-text-secondary text-xs ml-auto">
              {item.duration_minutes}m
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
          <Search size={18} color={colors.textMuted} />
          <TextInput
            className="flex-1 text-text-primary text-base ml-3"
            placeholder="Search classes..."
            placeholderTextColor={colors.textMuted}
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
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/10 items-center justify-center mb-4">
            <ShoppingBag size={36} color={colors.accent} />
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
