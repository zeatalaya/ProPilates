import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Home,
  Layers,
  Play,
  ShoppingBag,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import { useAuthStore } from "@propilates/shared";
import { supabase } from "../../../src/lib/supabase";
import { useThemeColors } from "../../../src/lib/theme";
import { fonts } from "../../../src/lib/fonts";

interface Stats {
  savedCount: number;
  taughtCount: number;
  listingCount: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const highlights = [
  {
    id: "1",
    title: "Welcome to ProPilates",
    subtitle: "Build, teach, and share your Pilates classes with the world.",
    color: "#8A7E72",
  },
  {
    id: "2",
    title: "Marketplace is Live",
    subtitle: "List your classes and earn revenue from other instructors.",
    color: "#16a34a",
  },
  {
    id: "3",
    title: "Spotify Integration",
    subtitle: "Connect Spotify to play music during your teaching sessions.",
    color: "#1DB954",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { instructor } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    savedCount: 0,
    taughtCount: 0,
    listingCount: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const loadStats = useCallback(async () => {
    if (!instructor) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [savedRes, listingRes, salesRes, instructorRes] = await Promise.all([
        supabase
          .from("classes")
          .select("id", { count: "exact", head: true })
          .eq("instructor_id", instructor.id),
        supabase
          .from("classes")
          .select("id", { count: "exact", head: true })
          .eq("instructor_id", instructor.id)
          .eq("is_public", true)
          .not("price", "is", null),
        supabase
          .from("portfolio_access")
          .select("price_paid, purchased_at")
          .eq("seller_address", instructor.id),
        supabase
          .from("instructors")
          .select("classes_taught")
          .eq("id", instructor.id)
          .single(),
      ]);

      const totalRevenue = (salesRes.data ?? []).reduce(
        (sum, s) => sum + Number(s.price_paid),
        0,
      );

      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);
      const monthlyRevenue = (salesRes.data ?? [])
        .filter((s) => new Date(s.purchased_at) >= firstOfMonth)
        .reduce((sum, s) => sum + Number(s.price_paid), 0);

      setStats({
        savedCount: savedRes.count ?? 0,
        taughtCount: instructorRes.data?.classes_taught ?? 0,
        listingCount: listingRes.count ?? 0,
        totalRevenue,
        monthlyRevenue,
      });
    } catch {
      // Keep defaults on error
    }

    setLoading(false);
  }, [instructor]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  // Not connected state
  if (!instructor) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: colors.accent + "18" }}
          >
            <Home size={36} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
            Welcome to ProPilates
          </Text>
          <Text className="text-text-secondary text-center mb-6 leading-5">
            Sign in to access your dashboard, build classes, and explore the
            marketplace.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)")}
            className="bg-violet-600 rounded-2xl px-8 py-4"
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statCards: {
    label: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    onPress: () => void;
  }[] = [
    {
      label: "Classes Saved",
      value: String(stats.savedCount),
      icon: <Layers size={20} color={colors.accent} />,
      onPress: () => router.push("/(tabs)/portfolio"),
    },
    {
      label: "Classes Taught",
      value: String(stats.taughtCount),
      icon: <Play size={20} color={colors.accent} />,
      onPress: () => router.push("/(tabs)/teach"),
    },
    {
      label: "Marketplace",
      value: String(stats.listingCount),
      icon: <ShoppingBag size={20} color={colors.accent} />,
      onPress: () => router.push("/(tabs)/marketplace"),
    },
    {
      label: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      subtitle: `This month: $${stats.monthlyRevenue.toFixed(2)}`,
      icon: <DollarSign size={20} color={colors.accent} />,
      onPress: () => router.push("/(tabs)/portfolio"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView className="flex-1 px-6">
        {/* Welcome */}
        <View className="pt-6 pb-4">
          <Text style={{ fontFamily: fonts.bold, fontSize: 26, color: colors.textPrimary, letterSpacing: -0.5 }}>
            {greeting}, {instructor.name?.split(" ")[0] || "there"}
          </Text>
          <Text className="text-text-secondary mt-1">
            Here&apos;s your overview
          </Text>
        </View>

        {/* Stats Grid */}
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3 mb-6">
            {statCards.map((card) => (
              <TouchableOpacity
                key={card.label}
                onPress={card.onPress}
                activeOpacity={0.7}
                className="bg-bg-card border border-border rounded-2xl p-4"
                style={{ width: "48%" }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: colors.accent + "18" }}
                  >
                    {card.icon}
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
                <Text className="text-text-primary text-2xl font-bold">
                  {card.value}
                </Text>
                <Text className="text-text-secondary text-xs mt-0.5">
                  {card.label}
                </Text>
                {card.subtitle ? (
                  <Text className="text-text-muted text-[10px] mt-1">
                    {card.subtitle}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/builder")}
            activeOpacity={0.8}
            style={{ backgroundColor: colors.accent, borderRadius: 16, flex: 1, paddingVertical: 16, alignItems: "center" }}
          >
            <Sparkles size={20} color="#fff" />
            <Text className="text-white font-semibold text-sm mt-1.5">
              New Class
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/marketplace")}
            activeOpacity={0.8}
            style={{ backgroundColor: colors.bgCard, borderRadius: 16, flex: 1, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
          >
            <ShoppingBag size={20} color={colors.textPrimary} />
            <Text className="text-text-primary font-semibold text-sm mt-1.5">
              Browse Market
            </Text>
          </TouchableOpacity>
        </View>

        {/* News & Highlights */}
        <Text style={{ fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary, marginBottom: 12 }}>
          News & Highlights
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={highlights}
          keyExtractor={(item) => item.id}
          scrollEnabled
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View
              className="bg-bg-card border border-border rounded-2xl mr-3 overflow-hidden"
              style={{ width: 280 }}
            >
              <View
                style={{
                  height: 100,
                  backgroundColor: item.color + "20",
                  justifyContent: "flex-end",
                  padding: 16,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: item.color + "30" }}
                >
                  <Sparkles size={20} color={item.color} />
                </View>
              </View>
              <View className="p-4">
                <Text className="text-text-primary font-semibold text-base mb-1">
                  {item.title}
                </Text>
                <Text className="text-text-secondary text-sm leading-5">
                  {item.subtitle}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Bottom spacing for tab bar */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
