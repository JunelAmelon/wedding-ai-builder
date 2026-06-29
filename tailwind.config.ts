import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        "cta-secondary": "#F97316",
        background: "#FFFFFF",
        surface: "#F6F7FB",
        success: "#22C55E",
        warning: "#FACC15",
        "text-primary": "#0B0F1A",
        "text-secondary": "#475569",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124,58,237,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(124,58,237,0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.18s ease-out",
        "pulse-glow": "pulse-glow 2s infinite",
        marquee: "marquee 18s linear infinite",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
