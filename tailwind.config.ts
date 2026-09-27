import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        green: {
          primary: "#22c55e",
          dark:    "#16a34a",
          light:   "#dcfce7",
          pale:    "#f0fdf4",
        },
        brand: {
          bg:      "#f8fafc",
          card:    "#ffffff",
          border:  "#e2e8f0",
          text:    "#0f172a",
          body:    "#334155",
          muted:   "#64748b",
          light:   "#94a3b8",
        },
      },
      fontFamily: {
        sans:    ["Inter", "Poppins", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        poppins: ["Poppins", "Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card:  "0 4px 16px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        green: "0 8px 32px rgba(34,197,94,0.25)",
        xl:    "0 20px 60px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      backgroundImage: {
        "hero-gradient":    "linear-gradient(145deg, #e8f8f5 0%, #d1f4ea 20%, #c8edfd 50%, #e0f7fa 70%, #f0fdf4 100%)",
        "app-gradient":     "linear-gradient(135deg, #e8f8f5 0%, #d1f4ea 40%, #c8edfd 80%, #e0f7fa 100%)",
        "green-gradient":   "linear-gradient(135deg, #22c55e, #16a34a)",
      },
      animation: {
        float:       "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
        "fade-up":    "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)", opacity: "0.3" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
