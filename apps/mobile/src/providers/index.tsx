import React, { type ReactNode, useEffect } from "react";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { setContractConfig } from "@propilates/shared";
import { ENV } from "../lib/config";

const queryClient = new QueryClient();

// Abstraxion uses native crypto modules — only available on native builds
let AbstraxionProviderComponent: React.ComponentType<{
  config: Record<string, unknown>;
  children: ReactNode;
}> | null = null;

if (Platform.OS !== "web") {
  try {
    const mod = require("@burnt-labs/abstraxion-react-native");
    AbstraxionProviderComponent = mod.AbstraxionProvider;
  } catch {
    // Will be null if native modules aren't available (e.g. Expo Go)
  }
}

const abstraxionConfig = {
  treasury: ENV.TREASURY_CONTRACT || undefined,
  rpcUrl: ENV.XION_RPC,
  gasPrice: "0.001uxion",
  callbackUrl: "propilates://",
};

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    setContractConfig({
      treasuryContract: ENV.TREASURY_CONTRACT,
      marketplaceContract: ENV.MARKETPLACE_CONTRACT,
      reclaimContract: ENV.RECLAIM_CONTRACT,
      usdcDenom: ENV.USDC_DENOM,
      xionRpc: ENV.XION_RPC,
      xionRest: ENV.XION_REST,
    });
  }, []);

  let content = (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // Wrap with AbstraxionProvider on native platforms
  if (AbstraxionProviderComponent) {
    content = (
      <AbstraxionProviderComponent config={abstraxionConfig}>
        {content}
      </AbstraxionProviderComponent>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
  );
}
