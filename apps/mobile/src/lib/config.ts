import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  SUPABASE_URL: extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  SUPABASE_ANON_KEY: extra.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  TREASURY_CONTRACT: process.env.EXPO_PUBLIC_TREASURY_CONTRACT ?? "",
  MARKETPLACE_CONTRACT: process.env.EXPO_PUBLIC_MARKETPLACE_CONTRACT ?? "",
  RECLAIM_CONTRACT:
    process.env.EXPO_PUBLIC_RECLAIM_CONTRACT ??
    "xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e",
  USDC_DENOM: process.env.EXPO_PUBLIC_USDC_DENOM ?? "ibc/usdc",
  XION_RPC: process.env.EXPO_PUBLIC_XION_RPC ?? "https://rpc.xion-testnet-2.burnt.com:443",
  XION_REST: process.env.EXPO_PUBLIC_XION_REST ?? "https://api.xion-testnet-2.burnt.com",
  CROSSMINT_API_KEY: process.env.EXPO_PUBLIC_CROSSMINT_API_KEY ?? "",
  CROSSMINT_COLLECTION_ID: process.env.EXPO_PUBLIC_CROSSMINT_COLLECTION_ID ?? "",
  SPOTIFY_CLIENT_ID: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
};
