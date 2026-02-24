import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode (default)
        primary: {
          DEFAULT: "#FF8C00", // Orange
          light: "#FFA726",
          dark: "#E67E00",
        },
        accent: {
          DEFAULT: "#0891B2", // Cyan
          light: "#06B6D4",
          dark: "#0E7490",
        },
        background: {
          DEFAULT: "#0F1419", // Navy
          light: "#1A2332", // Slate (cards)
          lighter: "#2D3F52",
        },
        // Light mode
        light: {
          primary: "oklch(48% 0.24 27)",
          white: "#FFFFFF",
          background: "#F9FAFB",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
