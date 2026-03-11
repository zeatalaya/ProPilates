import React from "react";
import { Tabs } from "expo-router";
import {
  Layers,
  BookOpen,
  Play,
  ShoppingBag,
  Briefcase,
  User,
} from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111118",
          borderTopColor: "#2a2a3a",
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#c9a96e",
        tabBarInactiveTintColor: "#55556a",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="builder"
        options={{
          title: "Builder",
          tabBarIcon: ({ color, size }) => (
            <Layers size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: "Templates",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="teach"
        options={{
          title: "Teach",
          tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
