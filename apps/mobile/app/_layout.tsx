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
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Providers } from "../src/providers";

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0f" },
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
