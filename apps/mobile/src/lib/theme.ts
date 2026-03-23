import { useColorScheme } from "react-native";

/**
 * Color palette inspired by Oak/Clay earth tones
 * and Sanzo Wada's "A Dictionary of Color Combinations Vol 1".
 *
 * Wada combination #264: warm browns with muted sage
 * Wada combination #171: taupe with terracotta and cream
 */

export const lightColors = {
  bg: "#FAF8F5",           // Warm off-white (Wada cream base)
  bgCard: "#F0ECE6",       // Warm light gray
  bgElevated: "#E5E0D8",   // Warm elevated surface
  border: "#DDD8CF",       // Warm border
  borderHover: "#C8C0B4",  // Hover state
  textPrimary: "#2C2825",  // Warm near-black
  textSecondary: "#6B6560", // Warm medium gray
  textMuted: "#9E9790",    // Warm muted
  accent: "#8A7E72",       // Clay (primary accent)
  accentDark: "#6E6358",   // Deeper clay
  success: "#7D9B76",      // Muted sage green (Wada #264)
  error: "#C67B6B",        // Muted terracotta (Wada #171)
  tabActive: "#8A7E72",    // Clay
  tabInactive: "#B5A99A",  // Oak
  ringBg: "#E5E0D8",       // Warm ring
};

export const darkColors = {
  bg: "#1A1815",           // Warm dark
  bgCard: "#242119",       // Warm dark card
  bgElevated: "#2E2A23",  // Warm dark elevated
  border: "#3D3830",       // Warm dark border
  borderHover: "#504A40",  // Warm dark hover
  textPrimary: "#F0ECE6",  // Warm off-white text
  textSecondary: "#B5A99A", // Oak
  textMuted: "#7A7268",    // Warm muted
  accent: "#B5A99A",       // Oak (lighter for dark mode contrast)
  accentDark: "#8A7E72",   // Clay
  success: "#9BB894",      // Lighter sage
  error: "#D4918A",        // Lighter terracotta
  tabActive: "#B5A99A",    // Oak
  tabInactive: "#7A7268",  // Warm muted
  ringBg: "#3D3830",       // Warm dark ring
};

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
