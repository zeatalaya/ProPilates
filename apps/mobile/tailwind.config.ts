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
          50: "#fdf8ec",
          100: "#faefd0",
          200: "#f5dda1",
          300: "#f0d898",
          400: "#c9a96e",
          500: "#b8892a",
          600: "#a07924",
          700: "#86641e",
          800: "#6d5019",
          900: "#563f14",
          950: "#2e210a",
        },
        text: { primary: "#f0f0f5", secondary: "#8888a0", muted: "#55556a" },
      },
    },
  },
  plugins: [],
};
export default config;
