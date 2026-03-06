import "react-native-get-random-values";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { ENV } from "./config";

let storageAdapter: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

if (Platform.OS !== "web") {
  // Only import SecureStore on native platforms
  const SecureStore = require("expo-secure-store");
  storageAdapter = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) =>
      SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
} else {
  // Use localStorage on web
  storageAdapter = {
    getItem: async (key: string) => localStorage.getItem(key),
    setItem: async (key: string, value: string) =>
      localStorage.setItem(key, value),
    removeItem: async (key: string) => localStorage.removeItem(key),
  };
}

export const supabase = createClient(
  ENV.SUPABASE_URL || "https://placeholder.supabase.co",
  ENV.SUPABASE_ANON_KEY || "placeholder-key",
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export const isSupabaseConfigured = !!(
  ENV.SUPABASE_URL &&
  ENV.SUPABASE_ANON_KEY &&
  !ENV.SUPABASE_URL.includes("placeholder")
);
