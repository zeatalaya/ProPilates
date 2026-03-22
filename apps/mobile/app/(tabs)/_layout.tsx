import React from "react";
import { useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import {
  Home,
  Layers,
  BookOpen,
  Play,
  ShoppingBag,
  Briefcase,
  User,
} from "lucide-react-native";
import { useThemeColors } from "../../src/lib/theme";

export default function TabsLayout() {
  const colors = useThemeColors();
  const scheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: scheme === "dark" ? "#111118" : "#FFFFFF",
          borderTopColor: scheme === "dark" ? "#2a2a3a" : "#E4E4EB",
          borderTopWidth: scheme === "dark" ? 1 : 0.5,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
          ...(scheme !== "dark" && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
          }),
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: "Builder",
          tabBarIcon: ({ color, size }) => <Layers size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: "Classes",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
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
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
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
