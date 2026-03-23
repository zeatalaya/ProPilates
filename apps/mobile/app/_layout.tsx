// Polyfills must be imported BEFORE anything that uses crypto
import "react-native-get-random-values";
import QuickCrypto, { install } from "react-native-quick-crypto";

// Install sets global.Buffer from @craftzdog/react-native-buffer
install();

// Set global.crypto for CosmJS / Abstraxion compatibility
// @ts-ignore – QuickCrypto provides Node-compatible crypto in RN
global.crypto = QuickCrypto as any;

import "../global.css";
import React from "react";
import { Appearance, ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import { Providers } from "../src/providers";

// Force light mode globally
Appearance.setColorScheme("light");

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Conso-Regular": CormorantGaramond_400Regular,
    "Conso-Medium": CormorantGaramond_500Medium,
    "Conso-SemiBold": CormorantGaramond_600SemiBold,
    "Conso-Bold": CormorantGaramond_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAF8F5", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#8A7E72" />
      </View>
    );
  }

  return (
    <Providers>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FAF8F5" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Providers>
  );
}
