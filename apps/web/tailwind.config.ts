import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
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
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
