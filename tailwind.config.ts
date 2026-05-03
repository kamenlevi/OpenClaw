import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#080a12",
          sidebar: "#0c0e1a",
          card: "#0f1220",
          elevated: "#141828",
        },
        border: {
          subtle: "#1e2535",
          heavy: "#2a3a5c",
        },
        accent: {
          primary: "#6d28d9",
          bright: "#7c3aed",
          active: "#8b5cf6",
        },
        rust: {
          DEFAULT: "#c87941",
          warm: "#a0622a",
          tint: "#1a0f08",
        },
        neon: {
          green: "#22c55e",
        },
        text: {
          primary: "#e2e8f0",
          muted: "#64748b",
          dim: "#374151",
        },
        team: {
          research: "#6d28d9",
          files: "#92400e",
          obsidian: "#166534",
          code: "#0e7490",
          scheduler: "#0f766e",
          notifications: "#a16207",
          security: "#991b1b",
          automation: "#334155",
          miso: "#f97316",
        },
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
      },
      animation: {
        bob: "bob 3s ease-in-out infinite",
        walk: "walk 8s linear infinite",
        "scroll-ticker": "scrollTicker 30s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        walk: {
          "0%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(20px)" },
          "100%": { transform: "translateX(0px)" },
        },
        scrollTicker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
