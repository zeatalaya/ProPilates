import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ShoppingCart, User, Clock, Layers } from "lucide-react-native";
import { Badge } from "../../../src/components/ui/Badge";
import { Card, CardBody } from "../../../src/components/ui/Card";
import { useAuthStore } from "@propilates/shared";
import { supabase } from "../../../src/lib/supabase";

interface ClassListing {
  id: string;
  title: string;
  description: string;
  method: string;
  difficulty: string;
  duration_minutes: number;
  price: number | null;
  instructor_id: string;
  instructor_name: string;
  block_count: number;
  exercise_count: number;
}

export default function ListingDetailScreen() {
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();
  const router = useRouter();
  const { instructor, xionAddress } = useAuthStore();
  const [listing, setListing] = useState<ClassListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    async function loadListing() {
      if (!tokenId) return;
      try {
        const { data } = await supabase
          .from("classes")
          .select("*, instructor:instructors(name), class_blocks(id, block_exercises(id))")
          .eq("id", tokenId)
          .single();

        if (data) {
          const blocks = data.class_blocks || [];
          const exerciseCount = blocks.reduce(
            (sum: number, b: any) => sum + (b.block_exercises?.length || 0),
            0,
          );
          setListing({
            id: data.id,
            title: data.title,
            description: data.description || "",
            method: data.method,
            difficulty: data.difficulty,
            duration_minutes: data.duration_minutes,
            price: data.price,
            instructor_id: data.instructor_id,
            instructor_name: data.instructor?.name || "Unknown",
            block_count: blocks.length,
            exercise_count: exerciseCount,
          });
        }
      } catch {
        // Will show empty state
      }
      setLoading(false);
    }
    loadListing();
  }, [tokenId]);

  const handlePurchase = async () => {
    if (!listing || !xionAddress || !instructor) {
      Alert.alert("Sign In Required", "Please sign in to purchase classes.");
      return;
    }
    if (listing.instructor_id === instructor.id) {
      Alert.alert("Own Class", "You cannot purchase your own class.");
      return;
    }

    setPurchasing(true);
    try {
      const { error } = await supabase.from("portfolio_access").insert({
        buyer_address: xionAddress,
        seller_address: listing.instructor_id,
        class_id: listing.id,
        token_id: listing.id,
        price_paid: listing.price || 0,
      });

      if (error) throw error;
      Alert.alert("Purchased", "Class added to your portfolio!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to complete purchase. Please try again.");
    }
    setPurchasing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#c9a96e" />
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-row items-center px-6 py-3 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#a0a0b8" />
          </TouchableOpacity>
          <Text className="text-text-primary font-semibold text-lg flex-1">
            Class Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-text-secondary">Class not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center px-6 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#a0a0b8" />
        </TouchableOpacity>
        <Text className="text-text-primary font-semibold text-lg flex-1">
          Class Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Title & Price */}
        <View className="mt-6 mb-4">
          <Text className="text-2xl font-bold text-text-primary mb-1">
            {listing.title}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Badge variant="violet">{listing.method}</Badge>
            <Badge variant="blue">{listing.difficulty}</Badge>
          </View>
        </View>

        {/* Price Card */}
        {listing.price != null && (
          <Card className="mb-4">
            <CardBody>
              <View className="flex-row items-center justify-between">
                <Text className="text-text-secondary">Price</Text>
                <Text className="text-emerald-400 font-bold text-2xl">
                  ${Number(listing.price).toFixed(2)} USDC
                </Text>
              </View>
            </CardBody>
          </Card>
        )}

        {/* Stats */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <CardBody className="items-center">
              <Layers size={20} color="#c9a96e" />
              <Text className="text-text-primary font-semibold mt-1">
                {listing.exercise_count}
              </Text>
              <Text className="text-text-secondary text-xs">Exercises</Text>
            </CardBody>
          </Card>
          <Card className="flex-1">
            <CardBody className="items-center">
              <Clock size={20} color="#c9a96e" />
              <Text className="text-text-primary font-semibold mt-1">
                {listing.duration_minutes}m
              </Text>
              <Text className="text-text-secondary text-xs">Duration</Text>
            </CardBody>
          </Card>
        </View>

        {/* Instructor */}
        <Card className="mb-4">
          <CardBody>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-violet-500/20 items-center justify-center mr-3">
                <User size={20} color="#c9a96e" />
              </View>
              <View>
                <Text className="text-text-primary font-medium">
                  {listing.instructor_name}
                </Text>
                <Text className="text-text-secondary text-sm">Instructor</Text>
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Description */}
        {listing.description ? (
          <Card className="mb-6">
            <CardBody>
              <Text className="text-text-secondary text-sm font-medium mb-1">
                Description
              </Text>
              <Text className="text-text-primary">{listing.description}</Text>
            </CardBody>
          </Card>
        ) : null}
      </ScrollView>

      {/* Buy Button */}
      {listing.price != null && (
        <View className="px-6 pb-6 pt-3 border-t border-border">
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-xl py-4 ${purchasing ? "bg-emerald-800" : "bg-emerald-600"}`}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <ShoppingCart size={20} color="#fff" />
                <Text className="text-white text-base font-semibold ml-2">
                  Buy for ${Number(listing.price).toFixed(2)} USDC
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
