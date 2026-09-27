import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0D1117",
          800: "#161B22",
          700: "#21262D",
          600: "#30363D",
          400: "#6E7681",
          200: "#C9D1D9",
          100: "#F0F2F4",
          50:  "#F8F9FA",
        },
        accent: {
          700: "#1E40AF",
          600: "#2563EB",
          500: "#3B82F6",
          100: "#DBEAFE",
          50:  "#EFF6FF",
        },
        // Amber = blocked/needs attention ONLY
        warn: {
          700: "#92400E",
          600: "#B45309",
          200: "#FDE68A",
          50:  "#FFFBEB",
        },
        // Sage = resolved ONLY
        ok: {
          700: "#166534",
          600: "#15803D",
          200: "#BBF7D0",
          50:  "#F0FDF4",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        xs:   ["0.75rem",  { lineHeight: "1.5"  }],
        sm:   ["0.875rem", { lineHeight: "1.5"  }],
        base: ["1rem",     { lineHeight: "1.6"  }],
        xl:   ["1.25rem",  { lineHeight: "1.3"  }],
        "4xl":["2.25rem",  { lineHeight: "1.1"  }],
        "6xl":["3.75rem",  { lineHeight: "1.0"  }],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm:  "4px",
        md:  "6px",
        lg:  "8px",
        xl:  "12px",
        "2xl": "16px",
        full: "9999px",
      },
      boxShadow: {
        card:   "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        panel:  "0 4px 12px rgba(0,0,0,0.15)",
        focus:  "0 0 0 3px rgba(37,99,235,0.3)",
      },
      spacing: {
        "0.5": "4px",
        "1":   "8px",
        "1.5": "12px",
        "2":   "16px",
        "3":   "24px",
        "4":   "32px",
        "6":   "48px",
        "8":   "64px",
        "12":  "96px",
      },
    },
  },
  plugins: [],
};
export default config;
