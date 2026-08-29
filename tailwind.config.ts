import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0E0E10",
        "cta-secondary": "#e64a5d",
        background: "#FFFFFF",
        surface: "#F7F7F9",
        success: "#3C8552",
        warning: "#F4D93E",
        "text-primary": "#0E0E10",
        "text-secondary": "#6B6B72",
        ink: "#0E0E10",
        grey: "#6B6B72",
        "grey-light": "#9A9AA1",
        line: "#EDEDF0",
        yellow: "#F4D93E",
        lavender: "#E4DBFB",
        "lavender-deep": "#8B7BD8",
        coral: "#e64a5d",
        "sage-chip": "#D8ECD9",
        sage: "#3C8552",
        "rose-chip": "#FBE1E6",
        bordeaux: "#8C2F39",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Space Grotesk", "ui-serif", "Georgia", "serif"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        allura: ["var(--font-allura)", "cursive"],
      },
      borderRadius: {
        "r-lg": "28px",
        "r-md": "20px",
        "r-sm": "14px",
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
    },
  },
  plugins: [],
};

export default config;
