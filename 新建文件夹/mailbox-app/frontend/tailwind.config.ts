import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00E5FF",
          50: "#E6FDFF",
          100: "#CCFBFF",
          200: "#99F7FF",
          300: "#66F3FF",
          400: "#33EFFF",
          500: "#00E5FF",
          600: "#00B8CC",
          700: "#008B99",
          800: "#005E66",
          900: "#003133",
        },
        accent: {
          DEFAULT: "#7C3AED",
        },
        bg: {
          DEFAULT: "#0A0E1A",
          soft: "#0F1426",
        }
      },
      boxShadow: {
        neon: "0 0 20px rgba(0,229,255,0.6)",
        glow: "0 0 40px rgba(124,58,237,0.5)",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
