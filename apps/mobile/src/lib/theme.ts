import { useColorScheme } from "react-native";

export const lightColors = {
  bg: "#FAFAFC",
  bgCard: "#FFFFFF",
  bgElevated: "#F3F3F8",
  border: "#E4E4EB",
  borderHover: "#C8C8D2",
  textPrimary: "#1A1A2E",
  textSecondary: "#646478",
  textMuted: "#9C9CAA",
  accent: "#c9a96e",
  accentDark: "#b8892a",
  success: "#16a34a",
  error: "#ef4444",
  tabActive: "#c9a96e",
  tabInactive: "#9C9CAA",
  ringBg: "#E4E4EB",
};

export const darkColors = {
  bg: "#0a0a0f",
  bgCard: "#111118",
  bgElevated: "#1a1a24",
  border: "#2a2a3a",
  borderHover: "#3a3a4f",
  textPrimary: "#f0f0f5",
  textSecondary: "#8888a0",
  textMuted: "#55556a",
  accent: "#c9a96e",
  accentDark: "#b8892a",
  success: "#34d399",
  error: "#ef4444",
  tabActive: "#c9a96e",
  tabInactive: "#55556a",
  ringBg: "#2a2a3a",
};

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
