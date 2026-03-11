import { useCallback, useEffect, useMemo } from "react";
import { Platform } from "react-native";
import { useAuthStore } from "@propilates/shared";

// Full type matching the Abstraxion RN SDK hook interface
interface AbstraxionAccountState {
  data: { bech32Address: string };
  isConnected: boolean;
  isConnecting: boolean;
  isInitializing?: boolean;
  isReturningFromAuth?: boolean;
  isLoggingIn?: boolean;
  isLoading: boolean;
  isError?: boolean;
  error?: string;
  login: () => Promise<void>;
  logout: () => void;
}

// Try to import the real hook on native platforms
let useNativeAbstraxionAccount: (() => AbstraxionAccountState) | null = null;
let useNativeSigningClient:
  | (() => { readonly client: unknown | undefined })
  | null = null;

if (Platform.OS !== "web") {
  try {
    const mod = require("@burnt-labs/abstraxion-react-native");
    useNativeAbstraxionAccount = mod.useAbstraxionAccount;
    useNativeSigningClient = mod.useAbstraxionSigningClient;
  } catch {
    // Not available (Expo Go or missing native modules)
  }
}

/**
 * Unified hook for XION account state.
 * Uses real Abstraxion SDK on native, falls back to demo mode on web.
 */
export function useAbstraxion(): AbstraxionAccountState {
  const authStore = useAuthStore();

  // On native with SDK available, use real hook
  if (useNativeAbstraxionAccount) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const account = useNativeAbstraxionAccount();

    // Sync Abstraxion state → Zustand store (in useEffect, not during render)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (account.isConnected && account.data.bech32Address) {
        if (authStore.xionAddress !== account.data.bech32Address) {
          authStore.setXionAddress(account.data.bech32Address);
        }
      }
    }, [account.isConnected, account.data.bech32Address]);

    // Wrap login to fall back to demo mode if native SDK fails (e.g. on simulator)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wrappedLogin = useCallback(async () => {
      try {
        await account.login();
      } catch {
        // Native SDK failed — fall back to demo mode
        const demoAddress = "xion1demo" + Date.now().toString(36);
        authStore.setXionAddress(demoAddress);
      }
    }, [account.login, authStore]);

    return { ...account, login: wrappedLogin };
  }

  // Web/fallback: use Zustand store as source of truth
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const login = useCallback(async () => {
    // Demo mode: generate a test address
    const demoAddress = "xion1demo" + Date.now().toString(36);
    authStore.setXionAddress(demoAddress);
  }, [authStore]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const logout = useCallback(() => {
    authStore.reset();
  }, [authStore]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(
    () => ({
      data: { bech32Address: authStore.xionAddress ?? "" },
      isConnected: authStore.isConnected,
      isConnecting: false,
      isLoading: authStore.isLoading,
      login,
      logout,
    }),
    [authStore.xionAddress, authStore.isConnected, authStore.isLoading, login, logout],
  );
}

/**
 * Returns the Abstraxion signing client (native only).
 */
export function useAbstraxionSigning() {
  if (useNativeSigningClient) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useNativeSigningClient();
  }
  return { client: undefined, signArb: undefined };
}
