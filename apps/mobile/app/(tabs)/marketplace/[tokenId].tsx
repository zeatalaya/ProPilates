import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ShoppingCart, User, Clock, Layers } from "lucide-react-native";
import { Badge } from "../../../src/components/ui/Badge";
import { Card, CardBody } from "../../../src/components/ui/Card";

export default function ListingDetailScreen() {
  const { tokenId } = useLocalSearchParams<{ tokenId: string }>();
  const router = useRouter();

  // In a full implementation, fetch listing details from contract
  const listing = {
    tokenId,
    name: "Class #" + tokenId,
    instructor: "Unknown Instructor",
    method: "reformer",
    difficulty: "intermediate",
    price: 4990000, // micro USDC
    description: "A comprehensive Pilates class.",
    exerciseCount: 12,
    duration: 3600,
    blocks: [],
  };

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
            {listing.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Badge variant="violet">{listing.method}</Badge>
            <Badge variant="blue">{listing.difficulty}</Badge>
          </View>
        </View>

        {/* Price Card */}
        <Card className="mb-4">
          <CardBody>
            <View className="flex-row items-center justify-between">
              <Text className="text-text-secondary">Price</Text>
              <Text className="text-emerald-400 font-bold text-2xl">
                ${(listing.price / 1_000_000).toFixed(2)} USDC
              </Text>
            </View>
          </CardBody>
        </Card>

        {/* Stats */}
        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <CardBody className="items-center">
              <Layers size={20} color="#c9a96e" />
              <Text className="text-text-primary font-semibold mt-1">
                {listing.exerciseCount}
              </Text>
              <Text className="text-text-secondary text-xs">Exercises</Text>
            </CardBody>
          </Card>
          <Card className="flex-1">
            <CardBody className="items-center">
              <Clock size={20} color="#c9a96e" />
              <Text className="text-text-primary font-semibold mt-1">
                {Math.round(listing.duration / 60)}m
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
                  {listing.instructor}
                </Text>
                <Text className="text-text-secondary text-sm">Instructor</Text>
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Description */}
        {listing.description && (
          <Card className="mb-6">
            <CardBody>
              <Text className="text-text-secondary text-sm font-medium mb-1">
                Description
              </Text>
              <Text className="text-text-primary">{listing.description}</Text>
            </CardBody>
          </Card>
        )}
      </ScrollView>

      {/* Buy Button */}
      <View className="px-6 pb-6 pt-3 border-t border-border">
        <TouchableOpacity className="flex-row items-center justify-center rounded-xl py-4 bg-emerald-600">
          <ShoppingCart size={20} color="#fff" />
          <Text className="text-white text-base font-semibold ml-2">
            Buy for ${(listing.price / 1_000_000).toFixed(2)} USDC
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
