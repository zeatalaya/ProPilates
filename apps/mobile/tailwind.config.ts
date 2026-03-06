import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0a0a0f", card: "#111118", elevated: "#1a1a24" },
        border: { DEFAULT: "#2a2a3a", hover: "#3a3a4f" },
        violet: {
          50: "#f3f0ff",
          100: "#e9e3ff",
          200: "#d4c9ff",
          300: "#b8a4ff",
          400: "#9b7aff",
          500: "#8257e5",
          600: "#7040d4",
          700: "#5c30b8",
          800: "#4a2596",
          900: "#3a1d78",
          950: "#1e0e42",
        },
        text: { primary: "#f0f0f5", secondary: "#8888a0", muted: "#55556a" },
      },
    },
  },
  plugins: [],
};
export default config;
