import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          hover: "rgb(var(--border-hover) / <alpha-value>)",
        },
        violet: {
          50: "#FAF8F5",
          100: "#F0ECE6",
          200: "#E0DAD0",
          300: "#C8BFB2",
          400: "#B5A99A",
          500: "#8A7E72",
          600: "#746960",
          700: "#5E554D",
          800: "#48413B",
          900: "#332E2A",
          950: "#1F1C19",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
